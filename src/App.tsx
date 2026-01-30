import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheetManager } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';
import StudioSDK from '@chili-publish/studio-sdk';
import { NotificationManagerProvider } from './contexts/NotificantionManager/NotificationManagerProvider';
import { SubscriberContextProvider } from './contexts/Subscriber';
import MainContent from './MainContent';
import { ProjectConfig } from './types/types';
import { Subscriber } from './utils/subscriber';
import FeatureFlagProvider from './contexts/FeatureFlagProvider';
import { EnvironmentClientApiProvider } from './contexts/EnvironmentClientApiContext';
import GlobalStyle from './styles/GlobalStyle';

declare global {
    interface Window {
        StudioUISDK: StudioSDK;
        SDK: StudioSDK;
    }
}

function App({ projectConfig }: { projectConfig: ProjectConfig }) {
    // TODO: Consider to define global object instead
    const [eventSubscriber] = useState(new Subscriber());

    const uiThemeMode = useMemo(() => {
        if (projectConfig.uiOptions.uiTheme === 'system') {
            const isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
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
                            <FeatureFlagProvider>
                                <EnvironmentClientApiProvider
                                    environmentApiService={projectConfig.environmentApiService}
                                >
                                    <MainContent projectConfig={projectConfig} />
                                </EnvironmentClientApiProvider>
                            </FeatureFlagProvider>
                        </NotificationManagerProvider>
                    </UiThemeProvider>
                </SubscriberContextProvider>
            </StyleSheetManager>
        </div>
    );
}

export default App;
