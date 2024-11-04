import { UiThemeProvider, useDebounce, useMobileSize, useTheme } from '@chili-publish/grafx-shared-components';
import StudioSDK, {
    AuthRefreshTypeEnum,
    ConnectorType,
    DocumentType,
    GrafxTokenAuthCredentials,
    LayoutIntent,
    Variable,
    WellKnownConfigurationKeys,
} from '@chili-publish/studio-sdk';
import { ConnectorInstance } from '@chili-publish/studio-sdk/lib/src/next';
import React, { useEffect, useRef, useState } from 'react';
import packageInfo from '../package.json';
import './App.css';
import { CanvasContainer, Container, MainContentContainer } from './App.styles';
import AnimationTimeline from './components/animationTimeline/AnimationTimeline';
import { ConnectorAuthenticationModal, useConnectorAuthentication } from './components/connector-authentication';
import LeftPanel from './components/layout-panels/leftPanel/LeftPanel';
import { useSubscriberContext } from './contexts/Subscriber';
import { UiConfigContextProvider } from './contexts/UiConfigContext';
import { VariablePanelContextProvider } from './contexts/VariablePanelContext';
import { Project, ProjectConfig } from './types/types';
import { getDataIdForSUI, getDataTestIdForSUI } from './utils/dataIds';
import MobileVariablesTray from './components/variables/MobileVariablesTray';
import StudioNavbar from './components/navbar/studioNavbar/StudioNavbar';
import Navbar from './components/navbar/Navbar';
import { APP_WRAPPER_ID } from './utils/constants';

declare global {
    interface Window {
        StudioUISDK: StudioSDK;
        SDK: StudioSDK;
    }
}

interface MainContentProps {
    projectConfig: ProjectConfig;
    authToken: string;
    updateToken: (newValue: string) => void;
}

function MainContent({ projectConfig, authToken, updateToken: setAuthToken }: MainContentProps) {
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

    const { subscriber: eventSubscriber } = useSubscriberContext();

    const enableAutoSaveRef = useRef(false);
    const isMobileSize = useMobileSize();

    const { canvas } = useTheme();

    const saveDocumentDebounced = useDebounce(() =>
        projectConfig.onProjectSave(async () => {
            const { data } = await window.StudioUISDK.document.getCurrentState();

            if (!data) {
                throw new Error('Document data is empty');
            }

            return data;
        }),
    );

    const {
        authenticationFlows,
        process: connectorAuthenticationProcess,
        createProcess: createAuthenticationProcess,
    } = useConnectorAuthentication();

    useEffect(() => {
        projectConfig
            .onProjectInfoRequested(projectConfig.projectId)
            .then((project) => {
                setCurrentProject(project);
            })
            .catch((err: Error) => {
                // eslint-disable-next-line no-console
                console.error(`[${MainContent.name}] Error`, err);
                return err;
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

        await window.StudioUISDK.canvas.zoomToPage(
            zoomParams.pageId,
            zoomParams.left,
            zoomParams.top,
            zoomParams.width,
            zoomParams.height,
        );
    };

    useEffect(() => {
        if (!eventSubscriber) {
            return;
        }
        const sdk = new StudioSDK({
            enableNextSubscribers: {
                onVariableListChanged: true,
            },
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
                        const connector = await window.StudioUISDK.next.connector.getById(request.connectorId);
                        const result = await createAuthenticationProcess(
                            async () => {
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                const res = await projectConfig.onConnectorAuthenticationRequested!(remoteConnectorId);
                                return res;
                            },
                            connector.parsedData?.name ?? '',
                            remoteConnectorId,
                        );
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
                eventSubscriber.emit('onVariableListChanged', variableList);
                setVariables(variableList);
                // NOTE(@pkgacek): because `onDocumentLoaded` action is currently broken,
                // we are using ref to keep track if the `onVariablesListChanged` was called second time.
                if (enableAutoSaveRef.current === true && !projectConfig.sandboxMode) {
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
                const layoutIntentData =
                    (await window.StudioUISDK.layout.getSelected()).parsedData?.intent.value ?? null;
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
            studioStyling: { uiBackgroundColorHex: canvas.backgroundColor },
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
        window.StudioUISDK = sdk;
        window.SDK = sdk;
        window.StudioUISDK.loadEditor();

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
        // eslint-disable-next-line consistent-return
        return () => {
            // Prevent loading multiple iframes
            const iframeContainer = document.getElementsByTagName('iframe')[0];
            iframeContainer?.remove();
            enableAutoSaveRef.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventSubscriber]);

    useEffect(() => {
        if (currentProject?.template?.id) {
            window.StudioUISDK.configuration.setValue(
                WellKnownConfigurationKeys.GraFxStudioTemplateId,
                currentProject.template.id,
            );
        }
    }, [currentProject?.template?.id]);

    useEffect(() => {
        const setHandTool = async () => {
            await window.StudioUISDK.tool.setHand();
        };
        setHandTool();
        const loadDocument = async () => {
            if (authToken) {
                await window.StudioUISDK.configuration.setValue(
                    WellKnownConfigurationKeys.GraFxStudioAuthToken,
                    authToken,
                );
            }

            if (!fetchedDocument) return;

            await window.StudioUISDK.document.load(fetchedDocument).then((res) => {
                setIsDocumentLoaded(res.success);
            });
            window.StudioUISDK.next.connector.getAllByType(ConnectorType.media).then(async (res) => {
                if (res.success && res.parsedData) {
                    setMediaConnectors(res.parsedData);
                }
            });

            window.StudioUISDK.next.connector.getAllByType('font' as ConnectorType).then(async (res) => {
                if (res.success && res.parsedData) {
                    setFontsConnectors(res.parsedData);
                }
            });

            const layoutIntentData = (await window.StudioUISDK.layout.getSelected()).parsedData?.intent.value || null;
            setLayoutIntent(layoutIntentData);
            zoomToPage();
        };

        loadDocument();
    }, [authToken, fetchedDocument]);

    return (
        <Container canvas={canvas}>
            <UiConfigContextProvider projectConfig={projectConfig} layoutIntent={layoutIntent}>
                <VariablePanelContextProvider connectors={{ mediaConnectors, fontsConnectors }} variables={variables}>
                    <div id={APP_WRAPPER_ID} className="app">
                        {projectConfig.sandboxMode ? (
                            <UiThemeProvider theme="studio" mode="dark">
                                <StudioNavbar
                                    projectName={projectConfig?.projectName || currentProject?.name}
                                    goBack={projectConfig?.onUserInterfaceBack}
                                    projectConfig={projectConfig}
                                    undoStackState={{ canRedo, canUndo }}
                                    zoom={currentZoom}
                                />
                            </UiThemeProvider>
                        ) : (
                            <Navbar
                                projectName={projectConfig?.projectName || currentProject?.name}
                                goBack={projectConfig?.onUserInterfaceBack}
                                projectConfig={projectConfig}
                                undoStackState={{ canRedo, canUndo }}
                                zoom={currentZoom}
                            />
                        )}

                        <MainContentContainer sandboxMode={projectConfig.sandboxMode}>
                            {!isMobileSize && <LeftPanel variables={variables} isDocumentLoaded={isDocumentLoaded} />}
                            <CanvasContainer>
                                {isMobileSize && (
                                    <MobileVariablesTray variables={variables} isDocumentLoaded={isDocumentLoaded} />
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
                        {authenticationFlows.length &&
                            authenticationFlows.map((authFlow) => (
                                <ConnectorAuthenticationModal
                                    key={authFlow.connectorId}
                                    name={authFlow.connectorName}
                                    onConfirm={() => connectorAuthenticationProcess(authFlow.connectorId)?.start()}
                                    onCancel={() => connectorAuthenticationProcess(authFlow.connectorId)?.cancel()}
                                />
                            ))}
                    </div>
                </VariablePanelContextProvider>
            </UiConfigContextProvider>
        </Container>
    );
}

export default React.memo(MainContent);
