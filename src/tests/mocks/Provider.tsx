import { PropsWithChildren, ReactElement, ReactNode } from 'react';
import { StyleSheetManager } from 'styled-components';
import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import {
    queries,
    Queries,
    render,
    renderHook,
    RenderHookOptions,
    RenderHookResult,
    RenderOptions,
    RenderResult,
} from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import isPropValid from '@emotion/is-prop-valid';
import {
    ConnectorsApi,
    ProjectsApi,
    UserInterfacesApi,
    SettingsApi,
    OutputApi,
    Configuration,
} from '@chili-publish/environment-client-api';
import { RootState, setupStore } from '../../store';
import { EnvironmentClientApiProvider } from '../../contexts/EnvironmentClientApiContext';

export interface WrapperProps {
    children: Element | ReactNode;
}

// Create mock API instances for testing
const createMockApiInstances = () => {
    const config = new Configuration({
        basePath: 'https://test.example.com',
        accessToken: 'test-token',
    });

    return {
        connectorsApi: new ConnectorsApi(config),
        projectsApi: new ProjectsApi(config),
        userInterfacesApi: new UserInterfacesApi(config),
        settingsApi: new SettingsApi(config),
        outputApi: new OutputApi(config),
        environment: 'test-environment',
    };
};

// Used to render test components with new instance of redux store.
export const renderWithProviders = <
    Q extends Queries = typeof queries,
    Container extends Element | DocumentFragment = HTMLElement,
    BaseElement extends Element | DocumentFragment = Container,
>(
    ui: ReactElement,
    {
        preloadedState,
        // Automatically create a store instance if no store was passed in
        reduxStore = setupStore(preloadedState),
        ...renderOptions
    }: Omit<RenderOptions<Q, Container, BaseElement>, 'wrapper'> & {
        preloadedState?: Partial<RootState>;
        reduxStore?: ReturnType<typeof setupStore>;
    } = {},
): RenderResult<Q, Container, BaseElement> & { reduxStore: ReturnType<typeof setupStore> } => {
    function Wrapper({ children }: PropsWithChildren<WrapperProps>) {
        const mockApiInstances = createMockApiInstances();

        return (
            <StyleSheetManager shouldForwardProp={isPropValid}>
                <ReduxProvider store={reduxStore}>
                    <EnvironmentClientApiProvider
                        connectorsApi={mockApiInstances.connectorsApi}
                        projectsApi={mockApiInstances.projectsApi}
                        userInterfacesApi={mockApiInstances.userInterfacesApi}
                        settingsApi={mockApiInstances.settingsApi}
                        outputApi={mockApiInstances.outputApi}
                        environment={mockApiInstances.environment}
                    >
                        <UiThemeProvider theme="platform">{children}</UiThemeProvider>
                    </EnvironmentClientApiProvider>
                </ReduxProvider>
            </StyleSheetManager>
        );
    }

    const rendered = render(ui, { wrapper: Wrapper, ...renderOptions });

    return {
        reduxStore,
        ...rendered,
        rerender: (rerenderUi: ReactElement) => rendered.rerender(<Wrapper>{rerenderUi}</Wrapper>),
    };
};

export const renderHookWithProviders = <
    Result,
    Props,
    Q extends Queries = typeof queries,
    Container extends Element | DocumentFragment = HTMLElement,
    BaseElement extends Element | DocumentFragment = Container,
>(
    hook: (initialProps: Props) => Result,
    {
        preloadedState,
        // Automatically create a store instance if no store was passed in
        reduxStore = setupStore(preloadedState),
        ...renderOptions
    }: Omit<RenderHookOptions<Props, Q, Container, BaseElement>, 'wrapper'> & {
        preloadedState?: Partial<RootState>;
        reduxStore?: ReturnType<typeof setupStore>;
    } = {},
): RenderHookResult<Result, Props> =>
    renderHook(hook, {
        wrapper: ({ children }: { children: ReactNode }) => {
            const mockApiInstances = createMockApiInstances();

            return (
                <StyleSheetManager shouldForwardProp={isPropValid}>
                    <ReduxProvider store={reduxStore}>
                        <EnvironmentClientApiProvider
                            connectorsApi={mockApiInstances.connectorsApi}
                            projectsApi={mockApiInstances.projectsApi}
                            userInterfacesApi={mockApiInstances.userInterfacesApi}
                            settingsApi={mockApiInstances.settingsApi}
                            outputApi={mockApiInstances.outputApi}
                            environment={mockApiInstances.environment}
                        >
                            <UiThemeProvider theme="platform">{children}</UiThemeProvider>
                        </EnvironmentClientApiProvider>
                    </ReduxProvider>
                </StyleSheetManager>
            );
        },
        ...renderOptions,
    });
