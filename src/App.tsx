import { useEffect, useRef, useState } from 'react';
import axios, { AxiosError } from 'axios';
import StudioSDK, { Variable, WellKnownConfigurationKeys, FrameLayoutType } from '@chili-publish/studio-sdk';
import packageInfo from '../package.json';
import Navbar from './components/navbar/Navbar';
import VariablesPanel from './components/variables/VariablesPanel';
import { ProjectConfig } from './types/types';
import AnimationTimeline from './components/animationTimeline/AnimationTimeline';
import useDebounce from './hooks/useDebounce';
import './App.css';

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

    const saveDocument = async (docEditorLink?: string, templateUrl?: string, token?: string) => {
        const url = templateUrl || (docEditorLink ? `${docEditorLink}/assets/assets/documents/demo.json` : null);

        // eslint-disable-next-line no-console
        console.log(`[${saveDocument.name}] Saving document`);

        if (url && import.meta.env.MODE !== 'development') {
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

                axios
                    .put(url, JSON.parse(document.data || '{}'), config)
                    .then(() => {
                        // eslint-disable-next-line no-console
                        console.log(`[${saveDocument.name}] Document saved`);
                    })
                    .catch((err) => {
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

    // eslint-disable-next-line no-console
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
                        console.error(err);
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
            onSelectedFrameLayoutChanged: (frameLayout: FrameLayoutType) => {
                // TODO: this is only for testing remove it when some integration is done
                // eslint-disable-next-line no-console
                console.log('%c⧭', 'color: #408059', frameLayout);
            },
            onVariableListChanged: (variableList: Variable[]) => {
                setVariables(variableList);

                // NOTE(@pkgacek): because `onDocumentLoaded` action is currently broken,
                // we are using ref to keep track if the `onVariablesListChanged` was called second time.
                if (enableAutoSaveRef.current === true) {
                    saveDocumentDebounced(editorLink, projectConfig?.templateUploadUrl, projectConfig?.authToken);
                }

                if (enableAutoSaveRef.current === false) {
                    // eslint-disable-next-line no-console
                    console.log(`[${App.name}] Autosaving enabled`);
                    enableAutoSaveRef.current = true;
                }
            },

            editorLink,
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
            'EUW version': packageInfo.version,
        });
        return () => {
            // PRevent loading multiple iframes
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
                    await window.SDK.connector.configure('grafx-font', async (configurator) => {
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
        <div className="app">
            <Navbar projectName={projectConfig?.projectName} goBack={projectConfig?.onBack} />
            <VariablesPanel variables={variables} />
            <div className="studio-ui-canvas" data-id="layout-canvas">
                <div className="chili-editor" id="chili-editor" />
            </div>

            <AnimationTimeline />
        </div>
    );
}

export default App;
