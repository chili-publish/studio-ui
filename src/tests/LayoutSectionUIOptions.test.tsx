// studio-ui/src/tests/LayoutSectionUIOptions.test.tsx
import { UiThemeProvider, useMobileSize } from '@chili-publish/grafx-shared-components';
import { ConfigType, LayoutListItemType } from '@chili-publish/studio-sdk';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { mockUserInterface } from '@mocks/mockUserinterface';
import AppProvider from '../contexts/AppProvider';
import { SubscriberContextProvider } from '../contexts/Subscriber';
import MainContent from '../MainContent';
import { ProjectConfig } from '../types/types';
import { getDataTestIdForSUI } from '../utils/dataIds';
import { Subscriber } from '../utils/subscriber';
import { renderWithProviders } from './mocks/Provider';

// Mock the useMobileSize hook
jest.mock('@chili-publish/grafx-shared-components', () => ({
    __esModule: true,
    ...jest.requireActual('@chili-publish/grafx-shared-components'),
    useMobileSize: jest.fn(),
}));

jest.mock('@chili-publish/studio-sdk', () => {
    const originalModule = jest.requireActual('@chili-publish/studio-sdk');

    return {
        __esModule: true,
        ...originalModule,
        /* eslint-disable */

        default: function (config: ConfigType) {
            const sdk = new originalModule.default(config);
            /* eslint-enable */
            return {
                ...sdk,
                loadEditor: jest.fn(),
                document: {
                    load: jest.fn().mockResolvedValue({ success: true }),
                    getCurrentState: jest.fn().mockResolvedValue({ data: '{}' }),
                },
                configuration: {
                    setValue: jest.fn(),
                },
                tool: {
                    setHand: jest.fn(),
                },
                next: {
                    connector: {
                        getAllByType: jest.fn().mockResolvedValue({ success: true, parsedData: [] }),
                        getById: jest.fn().mockResolvedValue({ success: true }),
                    },
                },
                dataSource: {
                    getDataSource: jest.fn().mockResolvedValue({ success: true }),
                },
                layout: {
                    getSelected: jest.fn().mockResolvedValue({
                        parsedData: {
                            intent: { value: null },
                            id: 'Layout-1',
                            name: 'Layout 1',
                        },
                    }),
                },
                canvas: {
                    zoomToPage: jest.fn(),
                },
            };
        },
    };
});

const mockProjectConfig = {
    projectId: '123',
    projectName: 'Test Project',
    sandboxMode: false,
    onProjectLoaded: jest.fn(),
    onProjectDocumentRequested: jest.fn().mockResolvedValue('{}'),
    onProjectInfoRequested: jest.fn().mockResolvedValue({}),
    onProjectSave: jest.fn(),
    onSetMultiLayout: jest.fn((setMultiLayout) => setMultiLayout(false)),
    onAuthenticationExpired: jest.fn(),
    outputSettings: {},
    onFetchUserInterfaceDetails: jest.fn().mockResolvedValue({
        userInterface: { id: '1', name: 'name' },
        outputSettings: [{ ...mockOutputSetting, layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'] }],
        formBuilder: mockUserInterface.formBuilder,
        outputSettingsFullList: [],
    }),
    userInterfaceID: mockUserInterface.id,
} as unknown as ProjectConfig;

describe('Layout Section UI Options', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    afterAll(() => {
        jest.resetAllMocks();
    });
    const setMobileView = (isMobile: boolean) => {
        (useMobileSize as jest.Mock).mockReturnValue(isMobile);
    };

    describe('Desktop View', () => {
        beforeEach(() => {
            setMobileView(false);
        });

        it('should not render layout section when "layoutSwitcherVisible" is false', async () => {
            renderWithProviders(
                <AppProvider isDocumentLoaded>
                    <SubscriberContextProvider subscriber={new Subscriber()}>
                        <MainContent
                            projectConfig={{
                                ...mockProjectConfig,
                                uiOptions: {
                                    layoutSection: {
                                        layoutSwitcherVisible: false,
                                    },
                                },
                            }}
                            updateToken={jest.fn()}
                        />
                    </SubscriberContextProvider>
                </AppProvider>,
            );

            await act(() => {
                window.StudioUISDK.config.events.onLayoutsChanged.trigger([
                    {
                        id: 'Layout-1',
                        name: 'Layout 1',
                        availableForUser: true,
                    },
                    {
                        id: 'Layout-2',
                        name: 'Layout 2',
                        availableForUser: true,
                    },
                ] as LayoutListItemType[]);
            });

            // Wait for async operations to complete
            await screen.findByTestId(getDataTestIdForSUI('canvas'));
            expect(screen.queryByText('Layout')).not.toBeInTheDocument();
        });

        it('should not render layout in multiLayout view', async () => {
            const { rerender } = renderWithProviders(
                <AppProvider isDocumentLoaded>
                    <SubscriberContextProvider subscriber={new Subscriber()}>
                        <MainContent
                            projectConfig={{
                                ...mockProjectConfig,
                                uiOptions: {
                                    layoutSection: {
                                        layoutSwitcherVisible: true,
                                    },
                                },
                            }}
                            updateToken={jest.fn()}
                        />
                    </SubscriberContextProvider>
                </AppProvider>,
            );

            await act(() => {
                window.StudioUISDK.config.events.onLayoutsChanged.trigger([
                    {
                        id: 'Layout-1',
                        name: 'Layout 1',
                        availableForUser: true,
                    },
                    {
                        id: 'Layout-2',
                        name: 'Layout 2',
                        availableForUser: true,
                    },
                ] as LayoutListItemType[]);
            });
            const multiLayoutMock = jest.fn((callback) => callback(true));

            await screen.findByTestId(getDataTestIdForSUI('canvas'));
            rerender(
                <AppProvider isDocumentLoaded>
                    <SubscriberContextProvider subscriber={new Subscriber()}>
                        <UiThemeProvider theme="platform">
                            <MainContent
                                projectConfig={{
                                    ...mockProjectConfig,
                                    uiOptions: {
                                        layoutSection: {
                                            layoutSwitcherVisible: true,
                                        },
                                    },
                                    onSetMultiLayout: multiLayoutMock,
                                }}
                                updateToken={jest.fn()}
                            />
                        </UiThemeProvider>
                    </SubscriberContextProvider>
                </AppProvider>,
            );

            expect(screen.queryByText('Layouts')).not.toBeInTheDocument();
        });

        it('should render layout with default title when widget is true', async () => {
            renderWithProviders(
                <AppProvider isDocumentLoaded>
                    <SubscriberContextProvider subscriber={new Subscriber()}>
                        <MainContent
                            projectConfig={{
                                ...mockProjectConfig,
                                uiOptions: {
                                    layoutSection: {
                                        layoutSwitcherVisible: true,
                                    },
                                },
                            }}
                            updateToken={jest.fn()}
                        />
                    </SubscriberContextProvider>
                </AppProvider>,
            );

            await screen.findByTestId(getDataTestIdForSUI('canvas'));

            await act(() => {
                window.StudioUISDK.config.events.onLayoutsChanged.trigger([
                    {
                        id: 'Layout-1',
                        name: 'Layout 1',
                        availableForUser: true,
                    },
                    {
                        id: 'Layout-2',
                        name: 'Layout 2',
                        availableForUser: true,
                    },
                ] as LayoutListItemType[]);
            });
            expect(screen.getByText('Layouts')).toBeInTheDocument();
        });

        it('should render layout with custom title', async () => {
            renderWithProviders(
                <AppProvider isDocumentLoaded>
                    <SubscriberContextProvider subscriber={new Subscriber()}>
                        <MainContent
                            projectConfig={{
                                ...mockProjectConfig,
                                uiOptions: {
                                    layoutSection: {
                                        layoutSwitcherVisible: true,
                                        title: 'Custom Layout Title',
                                    },
                                },
                            }}
                            updateToken={jest.fn()}
                        />
                    </SubscriberContextProvider>
                </AppProvider>,
            );

            await act(() => {
                window.StudioUISDK.config.events.onLayoutsChanged.trigger([
                    {
                        id: 'Layout-1',
                        name: 'Layout 1',
                        availableForUser: true,
                    },
                    {
                        id: 'Layout-2',
                        name: 'Layout 2',
                        availableForUser: true,
                    },
                ] as LayoutListItemType[]);
            });

            await screen.findByTestId(getDataTestIdForSUI('canvas'));
            expect(screen.getByText('Custom Layout Title')).toBeInTheDocument();
        });
    });

    describe('Mobile View', () => {
        beforeEach(() => {
            setMobileView(true);
        });

        it('should not render layout when widget is false', async () => {
            renderWithProviders(
                <AppProvider isDocumentLoaded>
                    <SubscriberContextProvider subscriber={new Subscriber()}>
                        <MainContent
                            projectConfig={{
                                ...mockProjectConfig,
                                uiOptions: {
                                    layoutSection: {
                                        layoutSwitcherVisible: false,
                                    },
                                },
                            }}
                            updateToken={jest.fn()}
                        />
                    </SubscriberContextProvider>
                </AppProvider>,
            );

            await act(() => {
                window.StudioUISDK.config.events.onLayoutsChanged.trigger([
                    {
                        id: 'Layout-1',
                        name: 'Layout 1',
                        availableForUser: true,
                    },
                    {
                        id: 'Layout-2',
                        name: 'Layout 2',
                        availableForUser: true,
                    },
                ] as LayoutListItemType[]);
            });

            await screen.findByTestId(getDataTestIdForSUI('canvas'));

            const openTrayBtn = screen.getByTestId(getDataTestIdForSUI('mobile-variables'));

            await userEvent.click(openTrayBtn);

            expect(screen.getByTestId('test-gsc-tray-header')).toHaveTextContent('Customize');
            expect(screen.queryByText('Layout')).not.toBeInTheDocument();
        });
        it('should not render layout in multiLayout view', async () => {
            const multiLayoutMock = jest.fn((callback) => callback(true));

            const { rerender } = renderWithProviders(
                <AppProvider isDocumentLoaded>
                    <SubscriberContextProvider subscriber={new Subscriber()}>
                        <MainContent
                            projectConfig={{
                                ...mockProjectConfig,
                                uiOptions: {
                                    layoutSection: {
                                        layoutSwitcherVisible: true,
                                    },
                                },
                            }}
                            updateToken={jest.fn()}
                        />
                    </SubscriberContextProvider>
                </AppProvider>,
            );

            await act(() => {
                window.StudioUISDK.config.events.onLayoutsChanged.trigger([
                    {
                        id: 'Layout-1',
                        name: 'Layout 1',
                        availableForUser: true,
                    },
                    {
                        id: 'Layout-2',
                        name: 'Layout 2',
                        availableForUser: true,
                    },
                ] as LayoutListItemType[]);
            });

            await screen.findByTestId(getDataTestIdForSUI('canvas'));

            rerender(
                <AppProvider isDocumentLoaded>
                    <SubscriberContextProvider subscriber={new Subscriber()}>
                        <UiThemeProvider theme="platform">
                            <MainContent
                                projectConfig={{
                                    ...mockProjectConfig,
                                    uiOptions: {
                                        layoutSection: {
                                            layoutSwitcherVisible: true,
                                        },
                                    },
                                    onSetMultiLayout: multiLayoutMock,
                                }}
                                updateToken={jest.fn()}
                            />
                        </UiThemeProvider>
                    </SubscriberContextProvider>
                </AppProvider>,
            );

            const openTrayBtn = await screen.findAllByTestId(getDataTestIdForSUI('mobile-variables'));
            await userEvent.click(openTrayBtn[0]);

            expect(multiLayoutMock).toHaveBeenCalled();
            expect(screen.getByTestId('test-gsc-tray-header')).toHaveTextContent('Customize');
            expect(screen.queryByText('Layout')).not.toBeInTheDocument();
        });

        it('should render layout with default title when widget is true', async () => {
            renderWithProviders(
                <AppProvider isDocumentLoaded>
                    <SubscriberContextProvider subscriber={new Subscriber()}>
                        <MainContent
                            projectConfig={{
                                ...mockProjectConfig,
                                uiOptions: {
                                    layoutSection: {
                                        layoutSwitcherVisible: true,
                                    },
                                },
                            }}
                            updateToken={jest.fn()}
                        />
                    </SubscriberContextProvider>
                </AppProvider>,
            );

            await act(() => {
                window.StudioUISDK.config.events.onLayoutsChanged.trigger([
                    {
                        id: 'Layout-1',
                        name: 'Layout 1',
                        availableForUser: true,
                    },
                    {
                        id: 'Layout-2',
                        name: 'Layout 2',
                        availableForUser: true,
                    },
                ] as LayoutListItemType[]);
            });

            await screen.findByTestId(getDataTestIdForSUI('canvas'));

            const openTrayBtn = screen.getByTestId(getDataTestIdForSUI('mobile-variables'));

            await userEvent.click(openTrayBtn);

            expect(screen.getByTestId('test-gsc-tray-header')).toHaveTextContent('Layout');
            expect(screen.queryByText('Customize')).toBeInTheDocument();
        });

        it('should render layout with custom title', async () => {
            renderWithProviders(
                <AppProvider isDocumentLoaded>
                    <SubscriberContextProvider subscriber={new Subscriber()}>
                        <MainContent
                            projectConfig={{
                                ...mockProjectConfig,
                                uiOptions: {
                                    layoutSection: {
                                        layoutSwitcherVisible: true,
                                        title: 'Custom Layout Title',
                                    },
                                },
                            }}
                            updateToken={jest.fn()}
                        />
                    </SubscriberContextProvider>
                </AppProvider>,
            );

            await act(() => {
                window.StudioUISDK.config.events.onLayoutsChanged.trigger([
                    {
                        id: 'Layout-1',
                        name: 'Layout 1',
                        availableForUser: true,
                    },
                    {
                        id: 'Layout-2',
                        name: 'Layout 2',
                        availableForUser: true,
                    },
                ] as LayoutListItemType[]);
            });

            await screen.findByTestId(getDataTestIdForSUI('canvas'));

            const openTrayBtn = screen.getByTestId(getDataTestIdForSUI('mobile-variables'));

            await userEvent.click(openTrayBtn);

            expect(screen.getByTestId('test-gsc-tray-header')).toHaveTextContent('Custom Layout Title');
            expect(screen.queryByText('Customize')).toBeInTheDocument();
        });
    });
});
