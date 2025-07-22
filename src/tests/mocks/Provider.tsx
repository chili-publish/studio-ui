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
import { RootState, setupStore } from '../../store';

export interface WrapperProps {
    children: Element | ReactNode;
}

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
        return (
            <StyleSheetManager shouldForwardProp={isPropValid}>
                <ReduxProvider store={reduxStore}>
                    <UiThemeProvider theme="platform">{children}</UiThemeProvider>
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
        wrapper: ({ children }: { children: ReactNode }) => (
            <StyleSheetManager shouldForwardProp={isPropValid}>
                <ReduxProvider store={reduxStore}>
                    <UiThemeProvider theme="platform">{children}</UiThemeProvider>
                </ReduxProvider>
            </StyleSheetManager>
        ),
        ...renderOptions,
    });
