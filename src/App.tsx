import { useEffect, useRef, useState } from 'react';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import StudioSDK, {
    Variable,
    WellKnownConfigurationKeys,
    DocumentType,
    ConnectorType,
    ConnectorInstance,
    LayoutIntent,
    AuthRefreshTypeEnum,
    GrafxTokenAuthCredentials,
} from '@chili-publish/studio-sdk';
import { Colors, UiThemeProvider, useDebounce, useMobileSize } from '@chili-publish/grafx-shared-components';
import packageInfo from '../package.json';
import Navbar from './components/navbar/Navbar';
import VariablesPanel from './components/variables/VariablesPanel';
import { Project, ProjectConfig } from './types/types';
import AnimationTimeline from './components/animationTimeline/AnimationTimeline';
import './App.css';
import LeftPanel from './components/layout-panels/leftPanel/LeftPanel';
import { VariablePanelContextProvider } from './contexts/VariablePanelContext';
import { CanvasContainer, MainContentContainer } from './App.styles';
import { getDataIdForSUI, getDataTestIdForSUI } from './utils/dataIds';
import { UiConfigContextProvider } from './contexts/UiConfigContext';
import { ConnectorAuthenticationModal, useConnectorAuthentication } from './components/connector-authentication';
import { NotificationManagerProvider } from './contexts/NotificantionManager/NotificationManagerProvider';
import { SubscriberContextProvider } from './contexts/Subscriber';
import { Subscriber } from './utils/subscriber';

declare global {
    interface Window {
        SDK: StudioSDK;
    }
}

function App({ projectConfig }: { projectConfig: ProjectConfig }) {
    const [authToken, setAuthToken] = useState(projectConfig.onAuthenticationRequested());
    const [fetchedDocument, setFetchedDocument] = useState('');
    const [variables, setVariables] = useState<Variable[]>([]);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [animationLength, setAnimationLength] = useState(0);
    const [scrubberTimeMs, setScrubberTimeMs] = useState(0);
    const [animationStatus, setAnimationStatus] = useState(false);
    const [currentZoom, setCurrentZoom] = useState<number>(100);
    const [currentProject, setCurrentProject] = useState<Project>();
    const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
    const [mediaConnectors, setMediaConnectors] = useState<ConnectorInstance[]>([]);
    const [fontsConnectors, setFontsConnectors] = useState<ConnectorInstance[]>([]);
    const [layoutIntent, setLayoutIntent] = useState<LayoutIntent | null>(null);
    const [eventSubscriber] = useState(new Subscriber());

    const enableAutoSaveRef = useRef(false);
    const isMobileSize = useMobileSize();

    const saveDocumentDebounced = useDebounce(() =>
        projectConfig.onProjectSave(async () => {
            const { data } = await window.SDK.document.getCurrentState();

            if (!data) {
                throw new Error('Document data is empty');
            }

            return data;
        }),
    );

    const {
        process: connectorAuthenticationProcess,
        createProcess: createAuthenticationProcess,
        connectorName,
    } = useConnectorAuthentication();

    useEffect(() => {
        const appendAuthorizationHeader = async (request: InternalAxiosRequestConfig<unknown>) => {
            if (
                !request.url?.startsWith(projectConfig.graFxStudioEnvironmentApiBaseUrl) &&
                !request.url?.startsWith(
                    projectConfig.graFxStudioEnvironmentApiBaseUrl.replace('api/v1/', 'api/experimental/'),
                )
            ) {
                return request;
            }

            // eslint-disable-next-line no-param-reassign
            request.headers.Authorization = `Bearer ${authToken}`;
            return request;
        };
        const subscriber = axios.interceptors.request.use(appendAuthorizationHeader);
        return () => {
            axios.interceptors.request.eject(subscriber);
        };
    }, [authToken, projectConfig.graFxStudioEnvironmentApiBaseUrl]);

    // This interceptor will resend the request after refreshing the token in case it is no longer valid
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            const originalRequest = error.config;
            if (error.response?.status === 401 && !originalRequest.retry && projectConfig) {
                originalRequest.retry = true;
                return projectConfig
                    .onAuthenticationExpired()
                    .then((token) => {
                        setAuthToken(token);
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axios(originalRequest);
                    })
                    .catch((err: AxiosError) => {
                        // eslint-disable-next-line no-console
                        console.error(`[${App.name}] Axios error`, err);
                        return err;
                    });
            }

            return Promise.reject(error);
        },
    );

    useEffect(() => {
        projectConfig.onProjectInfoRequested(projectConfig.projectId).then((project) => {
            setCurrentProject(project);
        });
    }, [projectConfig.onProjectInfoRequested, projectConfig.projectId, projectConfig]);

    const zoomToPage = async () => {
        const zoomParams = {
            pageId: null,
            left: 0,
            top: 0,
            width: Math.floor(document.getElementsByTagName('iframe')?.[0]?.getBoundingClientRect().width),
            height: Math.floor(document.getElementsByTagName('iframe')?.[0]?.getBoundingClientRect().height),
        };

        await window.SDK.canvas.zoomToPage(
            zoomParams.pageId,
            zoomParams.left,
            zoomParams.top,
            zoomParams.width,
            zoomParams.height,
        );
    };

    useEffect(() => {
        const sdk = new StudioSDK({
            async onAuthExpired(request) {
                try {
                    if (request.type === AuthRefreshTypeEnum.grafxToken) {
                        const newToken = await projectConfig.onAuthenticationExpired();
                        setAuthToken(newToken);
                        return new GrafxTokenAuthCredentials(newToken);
                    }

                    // "oAuth2AuthorizationCode" Environment API Connector's authorization entity type
                    // NOTE: We apply .toLowerCase() for both header and entity type as header came with first capital letter where entity type is fully camelCase
                    if (
                        request.type === AuthRefreshTypeEnum.any &&
                        !!request.headerValue?.toLowerCase().includes('oAuth2AuthorizationCode'.toLowerCase()) &&
                        !!projectConfig?.onConnectorAuthenticationRequested
                    ) {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const [_, remoteConnectorId] = request.headerValue.split(';').map((i) => i.trim());
                        const connector = await window.SDK.connector.getById(request.connectorId);
                        const result = await createAuthenticationProcess(async () => {
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            const res = await projectConfig.onConnectorAuthenticationRequested!(remoteConnectorId);
                            return res;
                        }, connector.parsedData?.name ?? '');
                        return result;
                    }
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error(error);
                    return null;
                }
                return null;
            },
            onVariableListChanged: (variableList: Variable[]) => {
                setVariables(variableList);
                // NOTE(@pkgacek): because `onDocumentLoaded` action is currently broken,
                // we are using ref to keep track if the `onVariablesListChanged` was called second time.
                if (enableAutoSaveRef.current === true) {
                    saveDocumentDebounced();
                }

                if (enableAutoSaveRef.current === false) {
                    enableAutoSaveRef.current = true;
                }
            },
            onSelectedLayoutPropertiesChanged: (layoutProperties) => {
                if (layoutProperties) {
                    setAnimationLength(layoutProperties.timelineLengthMs.value);
                    setLayoutIntent((layoutProperties?.intent as Record<string, unknown>)?.value as LayoutIntent);
                }
            },
            onSelectedLayoutIdChanged: async () => {
                zoomToPage();
                const layoutIntentData = (await window.SDK.layout.getSelected()).parsedData?.intent.value ?? null;
                setLayoutIntent(layoutIntentData);
            },
            onScrubberPositionChanged: (animationPlayback) => {
                setAnimationStatus(animationPlayback?.animationIsPlaying || false);
                setScrubberTimeMs(animationPlayback?.currentAnimationTimeMs || 0);
            },
            onUndoStackStateChanged: (undoStackState) => {
                setCanUndo(undoStackState.canUndo);
                setCanRedo(undoStackState.canRedo);
            },
            onZoomChanged: (zoom) => {
                setCurrentZoom(zoom);
            },
            studioStyling: { uiBackgroundColorHex: Colors.LIGHT_GRAY },
            documentType: DocumentType.project,
            studioOptions: {
                shortcutOptions: {
                    debugPanel: { enabled: false },
                    ellipse: { enabled: false },
                    hand: { enabled: true },
                    image: { enabled: false },
                    polygon: { enabled: false },
                    rectangle: { enabled: false },
                    select: { enabled: false },
                    text: { enabled: false },
                    zoom: { enabled: false },
                    viewMode: { enabled: false },
                },
            },
            editorLink: projectConfig.overrideEngineUrl,
        });

        // Connect to ths SDK
        window.SDK = sdk;
        window.SDK.loadEditor();

        // loadEditor is a synchronous call after which we are sure
        // the connection to the engine is established
        projectConfig.onProjectLoaded(currentProject as Project);

        projectConfig.onProjectDocumentRequested(projectConfig.projectId).then((template) => {
            setFetchedDocument(template);
        });

        // eslint-disable-next-line no-console
        console.table({
            'SDK version': packageInfo.dependencies['@chili-publish/studio-sdk'],
            'Studio UI version': packageInfo.version,
        });
        return () => {
            // Prevent loading multiple iframes
            const iframeContainer = document.getElementsByTagName('iframe')[0];
            iframeContainer?.remove();
            enableAutoSaveRef.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (currentProject?.template?.id) {
            window.SDK.configuration.setValue(
                WellKnownConfigurationKeys.GraFxStudioTemplateId,
                currentProject.template.id,
            );
        }
    }, [currentProject?.template?.id]);

    useEffect(() => {
        const setHandTool = async () => {
            if (fetchedDocument) {
                await window.SDK.tool.setHand();
            }
        };
        const loadDocument = async () => {
            if (authToken) {
                await window.SDK.configuration.setValue(WellKnownConfigurationKeys.GraFxStudioAuthToken, authToken);
            }

            if (!fetchedDocument) return;

            await window.SDK.document.load(fetchedDocument).then((res) => {
                setIsDocumentLoaded(res.success);
            });
            window.SDK.connector.getAllByType(ConnectorType.media).then(async (res) => {
                if (res.success && res.parsedData) {
                    setMediaConnectors(res.parsedData);
                }
            });

            window.SDK.connector.getAllByType('font' as ConnectorType).then(async (res) => {
                if (res.success && res.parsedData) {
                    setFontsConnectors(res.parsedData);
                }
            });

            const layoutIntentData = (await window.SDK.layout.getSelected()).parsedData?.intent.value || null;
            setLayoutIntent(layoutIntentData);

            setHandTool();
            zoomToPage();
        };

        loadDocument();
    }, [authToken, fetchedDocument]);

    useEffect(() => {
        // eslint-disable-next-line no-console
        console.table(projectConfig.onLogInfoRequested());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <SubscriberContextProvider subscriber={eventSubscriber}>
            <UiConfigContextProvider projectConfig={projectConfig} layoutIntent={layoutIntent}>
                <VariablePanelContextProvider connectors={{ mediaConnectors, fontsConnectors }}>
                    <UiThemeProvider theme="platform">
                        <NotificationManagerProvider>
                            <div id="studio-ui-application" className="app">
                                <Navbar
                                    projectName={projectConfig?.projectName || currentProject?.name}
                                    goBack={projectConfig?.onUserInterfaceBack}
                                    projectConfig={projectConfig}
                                    undoStackState={{ canRedo, canUndo }}
                                    zoom={currentZoom}
                                />
                                <MainContentContainer>
                                    {!isMobileSize && (
                                        <LeftPanel variables={variables} isDocumentLoaded={isDocumentLoaded} />
                                    )}
                                    <CanvasContainer>
                                        {isMobileSize && (
                                            <VariablesPanel variables={variables} isDocumentLoaded={isDocumentLoaded} />
                                        )}
                                        <div
                                            className="sui-canvas"
                                            data-id={getDataIdForSUI('canvas')}
                                            data-testid={getDataTestIdForSUI('canvas')}
                                        >
                                            <div className="chili-editor" id="chili-editor" />
                                        </div>
                                        {layoutIntent === LayoutIntent.digitalAnimated ? (
                                            <AnimationTimeline
                                                scrubberTimeMs={scrubberTimeMs}
                                                animationLength={animationLength}
                                                isAnimationPlaying={animationStatus}
                                            />
                                        ) : null}
                                    </CanvasContainer>
                                </MainContentContainer>
                                {connectorAuthenticationProcess && (
                                    <ConnectorAuthenticationModal
                                        name={connectorName}
                                        onConfirm={() => connectorAuthenticationProcess.start()}
                                        onCancel={() => connectorAuthenticationProcess.cancel()}
                                    />
                                )}
                            </div>
                        </NotificationManagerProvider>
                    </UiThemeProvider>
                </VariablePanelContextProvider>
            </UiConfigContextProvider>
        </SubscriberContextProvider>
    );
}

export default App;
