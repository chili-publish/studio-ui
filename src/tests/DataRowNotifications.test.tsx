import { ConfigType, DataRowAsyncError, LayoutIntent } from '@chili-publish/studio-sdk';
import { act, render, screen, waitFor } from '@testing-library/react';
import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import MainContent from '../MainContent';
import { ProjectConfig } from '../types/types';
import { SubscriberContextProvider } from '../contexts/Subscriber';
import { Subscriber } from '../utils/subscriber';
import { variables } from './mocks/mockVariables';
import { NotificationManagerProvider } from '../contexts/NotificantionManager/NotificationManagerProvider';
import { TOAST_ID } from '../contexts/NotificantionManager/Notification.types';

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
                            Promise.resolve({ success: true, intent: { value: LayoutIntent.print } }),
                        ),
                },
                document: { load: jest.fn().mockImplementation(() => Promise.resolve({ sucess: true })) },
                tool: { setHand: jest.fn() },
                canvas: { zoomToPage: jest.fn() },
                dataSource: { getDataSource: jest.fn().mockResolvedValue({ parsedData: null }) },
                variable: {
                    getByName: jest.fn().mockResolvedValue({ parsedData: variables[2] }),
                    getById: jest.fn().mockResolvedValue({ parsedData: variables[2] }),
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
    onAuthenticationExpired: jest.fn(),
    outputSettings: {},
} as unknown as ProjectConfig;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let originalAnimateFunction: any;

beforeAll(() => {
    originalAnimateFunction = HTMLDivElement.prototype.animate;

    const obj = {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onfinish: () => {},
    };

    const animationFunction = () => {
        Promise.resolve().then(async () => {
            act(() => obj.onfinish());
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return obj as any;
    };

    HTMLDivElement.prototype.animate = animationFunction;
});

afterAll(() => {
    HTMLDivElement.prototype.animate = originalAnimateFunction;
});

const renderComponent = () => {
    render(
        <SubscriberContextProvider subscriber={new Subscriber()}>
            <UiThemeProvider theme="platform">
                <NotificationManagerProvider>
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
                </NotificationManagerProvider>
            </UiThemeProvider>
        </SubscriberContextProvider>,
    );
};
describe('Data source error handling', () => {
    it('Should correctly show notification error for missing variable value', async () => {
        renderComponent();

        jest.spyOn(window.StudioUISDK.variable, 'getById').mockResolvedValue({
            success: true,
            status: 200,
            parsedData: variables[2],
        });

        await act(() => {
            window.StudioUISDK.config.events.onAsyncError.trigger(
                new DataRowAsyncError(2, '', [
                    {
                        type: 'missingVariable',
                        code: 403104,
                        message: 'Variable "varName" is missing',
                        context: { variableId: variables[2].id },
                    },
                ]),
            );
        });

        await waitFor(() => {
            expect(screen.getByTestId(TOAST_ID)).toHaveTextContent(
                `${variables[2].label} is invalid. The value is cleared.`,
            );
        });
    });

    it('Should correctly show notification error for variable invalid value exception', async () => {
        renderComponent();

        jest.spyOn(window.StudioUISDK.variable, 'getById').mockResolvedValue({
            success: true,
            status: 200,
            parsedData: variables[9],
        });

        await act(() => {
            window.StudioUISDK.config.events.onAsyncError.trigger(
                new DataRowAsyncError(2, '', [
                    {
                        type: 'resetVar',
                        code: 403032,
                        message: 'Variable "varName" is reseted',
                        context: { variableId: variables[9].id },
                    },
                ]),
            );
        });

        await waitFor(() => {
            expect(screen.getByTestId(TOAST_ID)).toHaveTextContent(
                `${variables[9].name} is invalid. A default value is used.`,
            );
        });
    });

    it('Should correctly show notification error for reset variable value exception of a number variable', async () => {
        renderComponent();

        jest.spyOn(window.StudioUISDK.variable, 'getById').mockResolvedValue({
            success: true,
            status: 200,
            parsedData: variables[5],
        });

        await act(() => {
            window.StudioUISDK.config.events.onAsyncError.trigger(
                new DataRowAsyncError(2, '', [
                    {
                        type: 'resetVar',
                        code: 403105,
                        message: 'Variable "varName" is reseted',
                        context: { variableId: variables[5].id },
                    },
                ]),
            );
        });

        await waitFor(() => {
            expect(screen.getByTestId(TOAST_ID)).toHaveTextContent(
                `${variables[5].label} is invalid. A default value is used.`,
            );
        });
    });
});
