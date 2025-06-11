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
        default: function () {
            /* eslint-enable */
            return {
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
});
