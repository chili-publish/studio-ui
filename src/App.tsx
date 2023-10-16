import { useEffect, useRef, useState } from 'react';
import axios, { AxiosError } from 'axios';
import StudioSDK, {
    Variable,
    WellKnownConfigurationKeys,
    DocumentType,
    ConnectorType,
    ConnectorInstance,
} from '@chili-publish/studio-sdk';
import { Colors, useDebounce, useMobileSize } from '@chili-publish/grafx-shared-components';
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
                        setAuthToken(token as string);
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
            width: Math.floor(document.getElementsByTagName('iframe')[0].getBoundingClientRect().width),
            height: Math.floor(document.getElementsByTagName('iframe')[0].getBoundingClientRect().height),
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
                }
            },
            onSelectedLayoutIdChanged() {
                zoomToPage();
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

        projectConfig.onProjectTemplateRequested(projectConfig.projectId).then((template) => {
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
        if (currentProject?.template.id) {
            window.SDK.configuration.setValue(
                WellKnownConfigurationKeys.GraFxStudioTemplateId,
                currentProject?.template.id ?? '',
            );
        }
    }, [currentProject?.template.id]);

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
        <UiConfigContextProvider projectConfig={projectConfig}>
            <VariablePanelContextProvider connectors={{ mediaConnectors, fontsConnectors }}>
                <div className="app">
                    <Navbar
                        projectName={projectConfig?.projectName || currentProject?.name}
                        goBack={projectConfig?.onUserInterfaceBack}
                        projectConfig={projectConfig}
                        undoStackState={{ canRedo, canUndo }}
                        zoom={currentZoom}
                    />
                    <MainContentContainer>
                        {!isMobileSize && <LeftPanel variables={variables} isDocumentLoaded={isDocumentLoaded} />}
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
                            <AnimationTimeline
                                scrubberTimeMs={scrubberTimeMs}
                                animationLength={animationLength}
                                isAnimationPlaying={animationStatus}
                            />
                        </CanvasContainer>
                    </MainContentContainer>
                </div>
            </VariablePanelContextProvider>
        </UiConfigContextProvider>
    );
}

export default App;
