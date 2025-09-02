import { LayoutIntent } from '@chili-publish/studio-sdk';
import MainContent from '../MainContent';
import { ProjectConfig } from '../types/types';
import { renderWithProviders } from './mocks/Provider';
import { APP_WRAPPER_ID } from '../utils/constants';
import AppProvider from '../contexts/AppProvider';
import { SubscriberContextProvider } from '../contexts/Subscriber';
import { Subscriber } from '../utils/subscriber';

jest.mock('@chili-publish/studio-sdk', () => {
    const originalModule = jest.requireActual('@chili-publish/studio-sdk');
    return {
        __esModule: true,
        ...originalModule,
        /* eslint-disable */
        default: function (config: any) {
            const sdk = new originalModule.default(config);
            /* eslint-enable */
            return {
                ...sdk,
                loadEditor: () => '',
                configuration: { setValue: jest.fn() },
                next: {
                    connector: {
                        getAllByType: jest
                            .fn()
                            .mockImplementation(() => Promise.resolve({ success: true, parsedData: [] })),
                    },
                },
                layout: {
                    getSelected: jest
                        .fn()
                        .mockImplementation(() =>
                            Promise.resolve({ parsedData: { intent: { value: LayoutIntent.print } } }),
                        ),
                },
                document: {
                    load: jest
                        .fn()
                        .mockImplementation()
                        .mockRejectedValue({ cause: { name: '303001' } }),
                },
                tool: { setHand: jest.fn() },
                canvas: { zoomToPage: jest.fn() },
                animation: { pause: jest.fn() },
                dataSource: { getDataSource: jest.fn().mockResolvedValue({ parsedData: null }) },
            };
        },
    };
});
describe('MainContent', () => {
    const mockProjectConfig: ProjectConfig = {
        projectId: 'projectId',
        projectName: 'projectName',
        onProjectInfoRequested: () => Promise.resolve({ name: '', id: '', template: { id: '1' } }),
        onProjectDocumentRequested: () => Promise.resolve('{}'),
        onProjectLoaded: () => null,
        onEngineInitialized: () => null,
        onProjectSave: () => Promise.resolve({ name: '', id: '', template: { id: '1' } }),
        onAuthenticationRequested: () => 'authToken',
        onAuthenticationExpired: () => Promise.resolve(''),
        onBack: () => null,
        onLogInfoRequested: () => null,
        onProjectGetDownloadLink: () =>
            Promise.resolve({ status: 0, error: '', success: false, parsedData: '', data: '' }),
        outputSettings: {},
        uiOptions: {},
        graFxStudioEnvironmentApiBaseUrl: '',
    };

    it('should render with default ltr direction', async () => {
        await renderWithProviders(
            <AppProvider isDocumentLoaded>
                <SubscriberContextProvider subscriber={new Subscriber()}>
                    <MainContent updateToken={jest.fn()} projectConfig={mockProjectConfig} />
                </SubscriberContextProvider>
            </AppProvider>,
        );

        const appWrapper = document.getElementById(APP_WRAPPER_ID);
        expect(appWrapper).toHaveAttribute('dir', 'ltr');
    });

    it('should render with rtl direction when specified', async () => {
        const rtlConfig = {
            ...mockProjectConfig,
            uiOptions: {
                ...mockProjectConfig.uiOptions,
                uiDirection: 'rtl' as const,
            },
        };
        await renderWithProviders(
            <AppProvider isDocumentLoaded>
                <SubscriberContextProvider subscriber={new Subscriber()}>
                    <MainContent updateToken={jest.fn()} projectConfig={rtlConfig} />
                </SubscriberContextProvider>
            </AppProvider>,
        );
        const appWrapper = document.getElementById(APP_WRAPPER_ID);
        expect(appWrapper).toHaveAttribute('dir', 'rtl');
    });

    it('should not call zoomToPage when in multiLayout mode', async () => {
        const mockZoomToPage = jest.fn();
        const multiLayoutConfig = {
            ...mockProjectConfig,
            onSetMultiLayout: jest.fn((setMultiLayout) => setMultiLayout(true)),
        };

        // Mock the SDK canvas.zoomToPage method
        const mockSDK = {
            ...jest.requireMock('@chili-publish/studio-sdk').default(),
            canvas: { zoomToPage: mockZoomToPage },
        };
        // @ts-expect-error: StudioUISDK is not a real property on window, but is used in the app
        window.StudioUISDK = jest.fn().mockReturnValue(mockSDK);

        await renderWithProviders(
            <AppProvider isDocumentLoaded>
                <SubscriberContextProvider subscriber={new Subscriber()}>
                    <MainContent updateToken={jest.fn()} projectConfig={multiLayoutConfig} />
                </SubscriberContextProvider>
            </AppProvider>,
        );

        // Wait for the component to initialize and trigger the onSelectedLayoutIdChanged event
        await new Promise((resolve) => {
            setTimeout(resolve, 0);
        });

        // Verify that zoomToPage was not called
        expect(mockZoomToPage).not.toHaveBeenCalled();
    });
});
