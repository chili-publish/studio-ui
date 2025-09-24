import { LayoutIntent } from '@chili-publish/studio-sdk';
import { EnvironmentApiService } from 'src/services/EnvironmentApiService';
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
        onGenerateOutput: () => Promise.resolve({ extensionType: 'pdf', outputData: new Blob() }),
        outputSettings: {},
        uiOptions: {},
        graFxStudioEnvironmentApiBaseUrl: '',
        onFetchOutputSettings: async () => {
            return null;
        },
        onFetchUserInterfaces: async () => {
            return { data: [], pageSize: 0 };
        },
        environmentApiService: {
            getProjectById: jest.fn().mockResolvedValue({
                id: '00000000-0000-0000-0000-000000000000',
                name: 'mockProjectName',
                template: { id: 'dddddd' },
            }),
            getProjectDocument: jest.fn().mockResolvedValue({ data: { mock: 'data' } }),
            saveProjectDocument: jest.fn().mockResolvedValue({ success: true }),
        } as unknown as EnvironmentApiService,
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

        // Create a mock SDK instance with proper structure
        const mockSDK = {
            loadEditor: () => '',
            configuration: { setValue: jest.fn() },
            config: {
                events: {
                    onDocumentLoaded: { registerCallback: jest.fn().mockReturnValue(() => {}) },
                    onVariableListChanged: { trigger: jest.fn() },
                    onLayoutsChanged: { trigger: jest.fn() },
                    onSelectedLayoutIdChanged: { trigger: jest.fn() },
                    onSelectedLayoutPropertiesChanged: { trigger: jest.fn() },
                },
            },
            canvas: { zoomToPage: mockZoomToPage },
            tool: { setHand: jest.fn() },
            animation: { pause: jest.fn() },
            next: {
                connector: {
                    getAllByType: jest.fn().mockResolvedValue({ success: true, parsedData: [] }),
                },
            },
            layout: {
                getSelected: jest.fn().mockResolvedValue({
                    parsedData: { intent: { value: 'print' } },
                }),
            },
            document: {
                load: jest.fn().mockRejectedValue({ cause: { name: '303001' } }),
            },
            dataSource: {
                getDataSource: jest.fn().mockResolvedValue({ parsedData: null }),
            },
        };
        // @ts-expect-error: StudioUISDK is not a real property on window, but is used in the app
        window.StudioUISDK = mockSDK;

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
