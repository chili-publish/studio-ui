import { useEffect, useState } from 'react';
import axios from 'axios';
import EditorSDK, { WellKnownConfigurationKeys } from '@chili-publish/editor-sdk';
import packageInfo from '../package.json';

import './App.css';

declare global {
    interface Window {
        SDK: EditorSDK;
    }
}

interface projectConfig {
    templateDownloadUrl: string;
    templateUploadUrl: string;
    templateId: string;
    graFxStudioEnvironmentApiBaseUrl: string;
    authToken?: string;
    refreshTokenAction: () => Promise<string>;
}
function App({ projectConfig, editorLink }: { projectConfig?: projectConfig; editorLink: string }) {
    const [authToken, setAuthToken] = useState(projectConfig?.authToken);
    const [fetchedDocument, setFetchedDocument] = useState('');

    // This interceptor will resend the request after refreshing the token in case it is no longer valid
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            const originalRequest = error.config;
            if (error.response.status === 401 && !originalRequest.retry && projectConfig) {
                originalRequest.retry = true;
                return projectConfig.refreshTokenAction().then((token) => {
                    setAuthToken(token);
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axios(originalRequest);
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
        const sdk = new EditorSDK({
            onSelectedFrameLayoutChanged: (frameLayout) => {
                // TODO: this is only for testing remove it when some integration is done
                // eslint-disable-next-line no-console
                console.log('%c⧭', 'color: #408059', frameLayout);
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
            'SDK version': packageInfo.dependencies['@chili-publish/editor-sdk'],
            'EUW version': packageInfo.version,
        });

        return () => {
            // PRevent loading multiple iframes
            const iframeContainer = document.getElementsByTagName('iframe')[0];
            iframeContainer?.remove();
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
        <div className="App">
            <div className="editor-workspace-canvas" data-id="layout-canvas">
                <div id="chili-editor" style={{ width: '100%', height: '100%' }} />
            </div>
        </div>
    );
}

export default App;
