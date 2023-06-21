import { useEffect, useRef, useState } from 'react';
import axios, { AxiosError } from 'axios';
import StudioSDK, { Variable, VariableType, WellKnownConfigurationKeys } from '@chili-publish/studio-sdk';
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

declare global {
    interface Window {
        SDK: StudioSDK;
    }
}

type HttpHeaders = { headers: { 'Content-Type': string; Authorization?: string } };

function App({ projectConfig, editorLink }: { projectConfig?: ProjectConfig; editorLink: string }) {
    const [authToken, setAuthToken] = useState(projectConfig?.authToken);
    const [fetchedDocument, setFetchedDocument] = useState('');
    const [variables, setVariables] = useState<Variable[]>([]);
    const enableAutoSaveRef = useRef(false);
    const isMobileSize = useMobileSize();

    const saveDocument = async (docEditorLink?: string, templateUrl?: string, token?: string) => {
        const url = templateUrl || (docEditorLink ? `${docEditorLink}/assets/assets/documents/demo.json` : null);

        if (url && process.env.NODE_ENV !== 'development') {
            try {
                const document = await window.SDK.document.getCurrentDocumentState();

                const config: HttpHeaders = {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };

                if (token) {
                    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
                }

                axios.put(url, JSON.parse(document.data || '{}'), config).catch((err) => {
                    // eslint-disable-next-line no-console
                    console.error(`[${saveDocument.name}] There was an issue saving document`);
                    return err;
                });
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(`[${saveDocument.name}] There was an fetching the current document state`);
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

    useEffect(() => {
        const sdk = new StudioSDK({
            onVariableListChanged: (variableList: Variable[]) => {
                const list = [
                    {
                        id: 'demo',
                        type: VariableType.list,
                        name: 'Variable List demo',
                        label: 'variable list label',
                        isHidden: false,
                        isReadonly: false,
                        isRequired: false,
                        selected: 'Opt2',
                        items: ['Opt1', 'Opt2', 'Opt3'],
                    },
                    {
                        id: 'demo22',
                        type: VariableType.list,
                        name: 'Variable List 22',
                        label: 'variable list 22',
                        isHidden: false,
                        isReadonly: false,
                        isRequired: false,
                        selected: 'Opt4',
                        items: ['Opt3', 'Opt4', 'Opt5'],
                    },
                    ...variableList,
                ];
                setVariables(list);

                // NOTE(@pkgacek): because `onDocumentLoaded` action is currently broken,
                // we are using ref to keep track if the `onVariablesListChanged` was called second time.
                if (enableAutoSaveRef.current === true) {
                    saveDocumentDebounced(editorLink, projectConfig?.templateUploadUrl, projectConfig?.authToken);
                }

                if (enableAutoSaveRef.current === false) {
                    enableAutoSaveRef.current = true;
                }
            },

            editorLink,
            studioStyling: { uiBackgroundColorHex: Colors.LIGHT_GRAY },
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
        fetchDocument(editorLink, projectConfig?.templateDownloadUrl, projectConfig?.authToken);

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
        const loadDocument = async () => {
            if (fetchedDocument) {
                await window.SDK.document.loadDocument(fetchedDocument);
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
        loadDocument();
    }, [authToken, fetchedDocument, projectConfig]);

    // eslint-disable-next-line no-console
    console.table({
        templateDownloadUrl: projectConfig?.templateDownloadUrl,
        templateUploadUrl: projectConfig?.templateUploadUrl,
        templateId: projectConfig?.templateId,
        graFxStudioEnvironmentApiBaseUrl: projectConfig?.graFxStudioEnvironmentApiBaseUrl,
    });

    return (
        <VariablePanelContextProvider>
            <div className="app">
                <Navbar
                    projectName={projectConfig?.projectName}
                    goBack={projectConfig?.onBack}
                    projectConfig={projectConfig}
                />
                <MainContentContainer>
                    {!isMobileSize && <LeftPanel variables={variables} />}
                    <CanvasContainer>
                        {isMobileSize && <VariablesPanel variables={variables} />}
                        <div className="studio-ui-canvas" data-id="layout-canvas">
                            <div className="chili-editor" id="chili-editor" />
                        </div>
                        <AnimationTimeline />
                    </CanvasContainer>
                </MainContentContainer>
            </div>
        </VariablePanelContextProvider>
    );
}

export default App;
