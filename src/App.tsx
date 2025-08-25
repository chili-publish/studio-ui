import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import axios, { AxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import 'react-datepicker/dist/react-datepicker.css';
import { StyleSheetManager } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';
import { NotificationManagerProvider } from './contexts/NotificantionManager/NotificationManagerProvider';
import { SubscriberContextProvider } from './contexts/Subscriber';
import MainContent from './MainContent';
import { ProjectConfig } from './types/types';
import { Subscriber } from './utils/subscriber';
import FeatureFlagProvider from './contexts/FeatureFlagProvider';
import { AuthTokenProvider } from './contexts/AuthTokenProvider';
import { EnvironmentApiProvider } from './contexts/EnvironmentApiProvider';
import GlobalStyle from './styles/GlobalStyle';

function App({ projectConfig }: { projectConfig: ProjectConfig }) {
    const [authToken, setAuthToken] = useState(projectConfig.onAuthenticationRequested());
    // TODO: Consider to define global object instead
    const [eventSubscriber] = useState(new Subscriber());

    const uiThemeMode = useMemo(() => {
        if (projectConfig.uiOptions.uiTheme === 'system') {
            const isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
            return isDarkTheme ? 'dark' : 'light';
        }
        return projectConfig.uiOptions.uiTheme;
    }, [projectConfig.uiOptions.uiTheme]);

    // temporary fix for the warnings of props being attached to HTML elements thrown by styled-components migration from v5 to v6
    const shouldForwardProp = useCallback((propName: string, target: unknown) => {
        if (typeof target === 'string') {
            // For HTML elements, forward the prop if it is a valid HTML attribute
            return isPropValid(propName);
        }
        // For other elements, forward all props
        return true;
    }, []);

    // This interceptor will resend the request after refreshing the token in case it is no longer valid
    useEffect(() => {
        const subscriber = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
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
        <div id="studio-ui-root-wrapper">
            <StyleSheetManager shouldForwardProp={shouldForwardProp}>
                <GlobalStyle fontFamily={projectConfig?.uiOptions.theme?.fontFamily} />
                <SubscriberContextProvider subscriber={eventSubscriber}>
                    <UiThemeProvider theme="platform" mode={uiThemeMode} themeUiConfig={projectConfig.uiOptions.theme}>
                        <NotificationManagerProvider>
                            <FeatureFlagProvider featureFlags={projectConfig.featureFlags}>
                                <AuthTokenProvider authToken={authToken}>
                                    <EnvironmentApiProvider
                                        environment={projectConfig.graFxStudioEnvironmentApiBaseUrl}
                                        authToken={authToken}
                                    >
                                        <MainContent updateToken={setAuthToken} projectConfig={projectConfig} />
                                    </EnvironmentApiProvider>
                                </AuthTokenProvider>
                            </FeatureFlagProvider>
                        </NotificationManagerProvider>
                    </UiThemeProvider>
                </SubscriberContextProvider>
            </StyleSheetManager>
        </div>
    );
}

export default App;
