import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { NotificationManagerProvider } from './contexts/NotificantionManager/NotificationManagerProvider';
import { SubscriberContextProvider } from './contexts/Subscriber';
import MainContent from './MainContent';
import { ProjectConfig } from './types/types';
import { Subscriber } from './utils/subscriber';
import ShortcutProvider from './contexts/ShortcutManager/ShortcutProvider';

function App({ projectConfig }: { projectConfig: ProjectConfig }) {
    const [authToken, setAuthToken] = useState(projectConfig.onAuthenticationRequested());
    // TODO: Consider to define global object instead
    const [eventSubscriber] = useState(new Subscriber());

    const uiThemeMode = useMemo(() => {
        if (projectConfig.uiTheme === 'system') {
            const isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
            return isDarkTheme ? 'dark' : 'light';
        }
        return projectConfig.uiTheme;
    }, [projectConfig.uiTheme]);

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
    useEffect(() => {
        const subscriber = axios.interceptors.response.use(
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
        return () => {
            axios.interceptors.response.eject(subscriber);
        };
    }, [projectConfig]);

    useEffect(() => {
        // eslint-disable-next-line no-console
        console.table(projectConfig.onLogInfoRequested());
    }, [projectConfig]);

    return (
        <SubscriberContextProvider subscriber={eventSubscriber}>
            <UiThemeProvider theme="platform" mode={uiThemeMode}>
                <NotificationManagerProvider>
                    <ShortcutProvider projectConfig={projectConfig}>
                        <MainContent authToken={authToken} updateToken={setAuthToken} projectConfig={projectConfig} />
                    </ShortcutProvider>
                </NotificationManagerProvider>
            </UiThemeProvider>
        </SubscriberContextProvider>
    );
}

export default App;
