import { useCallback, useEffect, useRef, useState } from 'react';
import axios, { AxiosError } from 'axios';
import StudioSDK, { Variable, WellKnownConfigurationKeys, DocumentType } from '@chili-publish/studio-sdk';
import { Colors, useDebounce } from '@chili-publish/grafx-shared-components';
import packageInfo from '../package.json';
import Navbar from './components/navbar/Navbar';
import VariablesPanel from './components/variables/VariablesPanel';
import { ProjectConfig } from './types/types';
import AnimationTimeline from './components/animationTimeline/AnimationTimeline';
import './App.css';
import LeftPanel from './components/layout-panels/leftPanel/LeftPanel';
import useMobileSize from './hooks/useMobileSize';
import { VariablePanelContextProvider } from './contexts/VariablePanelContext';
import { CanvasContainer, MainContentContainer } from './App.styles';
import { getDataIdForSUI, getDataTestIdForSUI } from './utils/dataIds';

declare global {
    interface Window {
        SDK: StudioSDK;
    }
}

type HttpHeaders = { headers: { 'Content-Type': string; Authorization?: string } };
type Project = { name: string; id: string; template: { id: string } };

function App({ projectConfig, editorLink }: { projectConfig?: ProjectConfig; editorLink?: string }) {
    const [authToken, setAuthToken] = useState(projectConfig?.authToken);
    const [fetchedDocument, setFetchedDocument] = useState('');
    const [variables, setVariables] = useState<Variable[]>([]);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [animationLength, setAnimationLength] = useState(0);
    const [scrubberTimeMs, setScrubberTimeMs] = useState(0);
    const [currentZoom, setCurrentZoom] = useState<number>(100);
    const [currentProject, setCurrentProject] = useState<Project>();
    const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
    const enableAutoSaveRef = useRef(false);
    const isMobileSize = useMobileSize();

    const saveDocument = async (docEditorLink?: string, templateUrl?: string, token?: string) => {
        const url = templateUrl || (docEditorLink ? `${docEditorLink}/assets/assets/documents/demo.json` : null);

        if (url && process.env.NODE_ENV !== 'development') {
            try {
                const document = await window.SDK.document.getCurrentState().then((res) => {
                    if (res.success) {
                        return res;
                    }
                    throw new Error();
                });
                const config: HttpHeaders = {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };

                if (token) {
                    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
                }
                if (document.data) {
                    axios.put(url, JSON.parse(document.data), config).catch((err) => {
                        // eslint-disable-next-line no-console
                        console.error(`[${saveDocument.name}] There was an issue saving document`);
                        return err;
                    });
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(`[${saveDocument.name}] There was an issue fetching the current document state`);
            }
        }
    };

    const saveDocumentDebounced = useDebounce((...args: (string | undefined)[]) => saveDocument(...args));

    // This interceptor will resend the request after refreshing the token in case it is no longer valid
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            const originalRequest = error.config;
            if (error.response.status === 401 && !originalRequest.retry && projectConfig) {
                originalRequest.retry = true;
                return projectConfig
                    .refreshTokenAction()
                    .then((token) => {
                        setAuthToken(token as string);
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axios(originalRequest);
                    })
                    .catch((err: AxiosError) => {
                        // eslint-disable-next-line no-console
                        console.error(`[${App.name}] Axios error`, err);
                    });
            }

            return Promise.reject(error);
        },
    );

    const fetchDocument = (docEditorLink?: string, templateUrl?: string, token?: string) => {
        const url = templateUrl || (docEditorLink ? `${docEditorLink}/assets/assets/documents/demo.json` : null);
        if (url) {
            const fetchPromise = token
                ? axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
                : axios.get(url);
            fetchPromise
                .then((response) => {
                    return response;
                })
                .then((res) => {
                    setFetchedDocument(JSON.stringify(res.data));
                })
                .catch(() => {
                    setFetchedDocument('{}');
                });
        } else {
            setFetchedDocument('{}');
        }
    };

    const getProject = useCallback(() => {
        axios
            .get(`${projectConfig?.graFxStudioEnvironmentApiBaseUrl}/projects/${projectConfig?.projectId}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            })
            .then((res) => {
                setCurrentProject(res.data);
            });
    }, [authToken, projectConfig?.graFxStudioEnvironmentApiBaseUrl, projectConfig?.projectId]);

    useEffect(() => {
        getProject();
    }, [getProject, projectConfig?.graFxStudioEnvironmentApiBaseUrl, projectConfig?.projectId]);

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
                    saveDocumentDebounced(editorLink, projectConfig?.projectUploadUrl, projectConfig?.authToken);
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
            onScrubberPositionChanged: (animationPlayback) => {
                setScrubberTimeMs(animationPlayback?.currentAnimationTimeMs || 0);
            },
            onUndoStackStateChanged: (undoStackState) => {
                setCanUndo(undoStackState.canUndo);
                setCanRedo(undoStackState.canRedo);
            },
            onZoomChanged: (zoom) => {
                setCurrentZoom(zoom);
            },

            editorLink,
            studioStyling: { uiBackgroundColorHex: Colors.LIGHT_GRAY },
            documentType: DocumentType.project,
        });

        // Connect to ths SDK
        window.SDK = sdk;
        window.SDK.loadEditor();
        // loadEditor is a synchronous call after which we are sure
        // the connection to the engine is established
        window.SDK.configuration.setValue(
            WellKnownConfigurationKeys.GraFxStudioEnvironmentApiUrl,
            projectConfig?.graFxStudioEnvironmentApiBaseUrl ?? '',
        );
        fetchDocument(editorLink, projectConfig?.projectDownloadUrl, projectConfig?.authToken);

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
        const loadDocument = async () => {
            if (fetchedDocument) {
                await window.SDK.document.load(fetchedDocument).then((res) => {
                    setIsDocumentLoaded(res.success);
                });
                zoomToPage();

                if (authToken) {
                    await window.SDK.connector.configure('grafx-media', async (configurator) => {
                        await configurator.setChiliToken(authToken);
                    });
                    await window.SDK.connector.configure('grafx-font', async (configurator) => {
                        await configurator.setChiliToken(authToken);
                    });
                }
            }
        };

        const setHandTool = async () => {
            if (fetchedDocument) {
                await window.SDK.tool.setHand();
            }
        };

        loadDocument();
        setHandTool();
    }, [authToken, fetchedDocument, projectConfig]);

    useEffect(() => {
        // eslint-disable-next-line no-console
        console.table({
            projectDownloadUrl: projectConfig?.projectDownloadUrl,
            projectUploadUrl: projectConfig?.projectUploadUrl,
            projectId: projectConfig?.projectId,
            graFxStudioEnvironmentApiBaseUrl: projectConfig?.graFxStudioEnvironmentApiBaseUrl,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <VariablePanelContextProvider>
            <div className="app">
                <Navbar
                    projectName={projectConfig?.projectName || currentProject?.name}
                    goBack={projectConfig?.onBack}
                    projectConfig={projectConfig}
                    undoStackState={{ canRedo, canUndo }}
                    zoom={currentZoom}
                />
                <MainContentContainer>
                    {!isMobileSize && <LeftPanel variables={variables} isDocumentLoaded={isDocumentLoaded} />}
                    <CanvasContainer>
                        {isMobileSize && <VariablesPanel variables={variables} isDocumentLoaded={isDocumentLoaded} />}
                        <div
                            className="sui-canvas"
                            data-id={getDataIdForSUI('canvas')}
                            data-testid={getDataTestIdForSUI('canvas')}
                        >
                            <div className="chili-editor" id="chili-editor" />
                        </div>
                        <AnimationTimeline scrubberTimeMs={scrubberTimeMs} animationLength={animationLength} />
                    </CanvasContainer>
                </MainContentContainer>
            </div>
        </VariablePanelContextProvider>
    );
}

export default App;
