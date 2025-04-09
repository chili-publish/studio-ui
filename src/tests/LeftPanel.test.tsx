import { UiThemeProvider, getDataTestId } from '@chili-publish/grafx-shared-components';
import EditorSDK, { LayoutPropertiesType } from '@chili-publish/studio-sdk';
import { mockAssets } from '@mocks/mockAssets';
import { mockLayout, mockLayouts } from '@mocks/mockLayout';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import { act } from 'react-dom/test-utils';
import LeftPanel from '../components/layout-panels/leftPanel/LeftPanel';
import AppProvider from '../contexts/AppProvider';
import { VariablePanelContextProvider } from '../contexts/VariablePanelContext';
import { getDataTestIdForSUI } from '../utils/dataIds';
import { APP_WRAPPER } from './mocks/app';
import { variables } from './mocks/mockVariables';

jest.mock('@chili-publish/studio-sdk');
jest.mock('../components/variablesComponents/imageVariable/useVariableConnector', () => ({
    useVariableConnector: () => ({
        remoteConnector: {
            supportedAuthentication: {
                browser: ['none'],
            },
        },
    }),
}));
const mockSDK = mock<EditorSDK>();

beforeEach(() => {
    global.URL.createObjectURL = jest.fn();
    mockSDK.mediaConnector.query = jest
        .fn()
        .mockImplementation()
        .mockReturnValue(
            Promise.resolve({
                success: true,
                status: 0,
                data: JSON.stringify({ pageSize: 2, data: mockAssets }),
                parsedData: {
                    pageSize: 2,
                    data: mockAssets,
                },
            }),
        );

    mockSDK.mediaConnector.detail = jest
        .fn()
        .mockImplementation()
        .mockReturnValue(
            Promise.resolve({
                parsedData: {
                    id: 'f82a05ba-c592-4f3f-89a3-5b92ca096d01',
                    name: 'Overprint Doc FOGRA',
                    relativePath: '/00 CHILI SUPPORT',
                    type: 0,
                    extension: 'jpeg',
                    metaData: {},
                },
            }),
        );

    mockSDK.mediaConnector.download = jest.fn().mockImplementation().mockReturnValue(Promise.resolve(new Uint8Array()));

    mockSDK.connector.getState = jest
        .fn()
        .mockImplementation()
        .mockReturnValue(Promise.resolve({ parsedData: { type: 'ready' } }));

    mockSDK.variable.setValue = jest
        .fn()
        .mockImplementation()
        .mockReturnValue(
            Promise.resolve({
                success: true,
                status: 0,
                data: '',
                parsedData: null,
            }),
        );
    mockSDK.connector.waitToBeReady = jest
        .fn()
        .mockImplementation()
        .mockReturnValue(Promise.resolve([1, 2, 3]));

    mockSDK.mediaConnector.getCapabilities = jest
        .fn()
        .mockImplementation()
        .mockReturnValue(
            Promise.resolve({
                parsedData: { copy: false, detail: true, filtering: true, query: true, remove: false, upload: false },
            }),
        );

    mockSDK.connector.getMappings = jest.fn().mockResolvedValue({
        parsedData: null,
    });
    mockSDK.variable.getAll = jest.fn().mockResolvedValue({
        parsedData: null,
    });

    window.StudioUISDK = mockSDK;

    window.IntersectionObserver = jest.fn(
        () =>
            ({
                observe: jest.fn(),
                unobserve: jest.fn(),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any),
    );
});

afterEach(() => {
    jest.clearAllMocks();
});
describe('Image Panel', () => {
    test('Navigation to and from image panel works', async () => {
        const user = userEvent.setup();
        const { getByText, getByRole } = render(
            <AppProvider isDocumentLoaded>
                <UiThemeProvider theme="platform">
                    <VariablePanelContextProvider variables={variables}>
                        <LeftPanel
                            variables={variables}
                            selectedLayout={mockLayout}
                            layouts={mockLayouts}
                            layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                            layoutSectionUIOptions={{
                                visible: false,
                                layoutSwitcherVisible: false,
                                title: 'Layout',
                            }}
                        />
                    </VariablePanelContextProvider>
                </UiThemeProvider>
            </AppProvider>,
            { container: document.body.appendChild(APP_WRAPPER) },
        );
        const imagePicker = await screen.findAllByTestId(getDataTestId('image-picker-content'));
        expect(imagePicker[0]).toBeInTheDocument();

        await act(async () => {
            await user.click(imagePicker[0]);
        });

        const goBackButton = getByRole('button');
        expect(goBackButton).toBeInTheDocument();
        await act(async () => {
            await user.click(goBackButton);
        });

        expect(getByText('Customize')).toBeInTheDocument();
    });

    test('Media assets are correctly fetched', async () => {
        const user = userEvent.setup();
        const { getByText, getByTestId, getAllByText } = render(
            <AppProvider isDocumentLoaded>
                <UiThemeProvider theme="platform">
                    <VariablePanelContextProvider variables={variables}>
                        <LeftPanel
                            variables={variables}
                            selectedLayout={mockLayout}
                            layouts={mockLayouts}
                            layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                            layoutSectionUIOptions={{
                                visible: false,
                                layoutSwitcherVisible: false,
                                title: 'Layout',
                            }}
                        />
                    </VariablePanelContextProvider>
                </UiThemeProvider>
            </AppProvider>,
            { container: document.body.appendChild(APP_WRAPPER) },
        );
        const imagePicker = await screen.findAllByTestId(getDataTestId('image-picker-content'));
        await act(async () => {
            await user.click(imagePicker[0]);
        });
        const folder = await screen.findByTestId(getDataTestId('preview-container-grafx'));
        expect(folder).toBeInTheDocument();

        const container = getByTestId(getDataTestIdForSUI('resources-container'));
        // includes one the placeholder element used for getting next page (2 elements returned by the API and 1 placeholder div)
        expect(container.childNodes).toHaveLength(3);

        expect(getAllByText(/grafx/i)).not.toHaveLength(0);
        expect(getByText('ProductShot')).toBeInTheDocument();
        expect(getByText('grafx')).toBeInTheDocument();
    });

    test('Media asset folder navigation works', async () => {
        const user = userEvent.setup();
        const { getByText } = render(
            <AppProvider isDocumentLoaded>
                <UiThemeProvider theme="platform">
                    <VariablePanelContextProvider variables={variables}>
                        <LeftPanel
                            variables={variables}
                            selectedLayout={mockLayout}
                            layouts={mockLayouts}
                            layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                            layoutSectionUIOptions={{
                                visible: false,
                                layoutSwitcherVisible: false,
                                title: 'Layout',
                            }}
                        />
                    </VariablePanelContextProvider>
                </UiThemeProvider>
            </AppProvider>,
            { container: document.body.appendChild(APP_WRAPPER) },
        );
        const imagePicker = await screen.findAllByTestId(getDataTestId('image-picker-content'));
        await act(async () => {
            await user.click(imagePicker[0]);
        });
        const image = (await screen.findAllByRole('img', { name: /grafx/i }, { timeout: 5000 }))[0];
        await act(async () => {
            await user.click(image);
        });

        const breadCrumb = getByText('Home');
        expect(breadCrumb).toBeInTheDocument();
    });

    test.skip('Image Picker updates image after asset is selected', async () => {
        const user = userEvent.setup();
        const { getByRole } = render(
            <AppProvider isDocumentLoaded>
                <UiThemeProvider theme="platform">
                    <VariablePanelContextProvider variables={variables}>
                        <LeftPanel
                            variables={variables}
                            selectedLayout={mockLayout}
                            layouts={mockLayouts}
                            layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                            layoutSectionUIOptions={{
                                visible: false,
                                layoutSwitcherVisible: false,
                                title: 'Layout',
                            }}
                        />
                    </VariablePanelContextProvider>
                </UiThemeProvider>
            </AppProvider>,
        );
        const imagePicker = await screen.findAllByTestId(getDataTestId('image-picker-content'));
        await act(async () => {
            await user.click(imagePicker[0]);
        });
        const image = getByRole('img', { name: mockAssets[1].name });

        await act(async () => {
            await user.click(image);
        });

        expect(window.StudioUISDK.variable.setImageVariableConnector).toHaveBeenCalledTimes(1);
        expect(window.StudioUISDK.variable.setValue).toHaveBeenCalledTimes(1);
    });
    test('Do not render search input when filtering is not supported', async () => {
        const user = userEvent.setup();
        mockSDK.mediaConnector.getCapabilities = jest
            .fn()
            .mockImplementation()
            .mockReturnValue(
                Promise.resolve({
                    parsedData: {
                        copy: false,
                        detail: true,
                        filtering: false,
                        query: true,
                        remove: false,
                        upload: false,
                    },
                }),
            );

        render(
            <AppProvider isDocumentLoaded>
                <UiThemeProvider theme="platform">
                    <VariablePanelContextProvider variables={variables}>
                        <LeftPanel
                            variables={variables}
                            selectedLayout={mockLayout}
                            layouts={mockLayouts}
                            layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                            layoutSectionUIOptions={{
                                visible: false,
                                layoutSwitcherVisible: false,
                                title: 'Layout',
                            }}
                        />
                    </VariablePanelContextProvider>
                </UiThemeProvider>
            </AppProvider>,
            { container: document.body.appendChild(APP_WRAPPER) },
        );
        const imagePicker = await screen.findAllByTestId(getDataTestId('image-picker-content'));
        await act(async () => {
            await user.click(imagePicker[0]);
        });

        const image = await screen.findAllByRole('img', { name: /grafx/i });
        expect(image[0]).toBeInTheDocument();

        await act(async () => {
            await user.click(image[0]);
        });

        const input = screen.queryByTestId(getDataTestIdForSUI('media-panel-search-input'));
        expect(input).toBeNull();
    });
    test('Render search input when filtering is supported', async () => {
        const user = userEvent.setup();
        const { getByTestId } = render(
            <AppProvider isDocumentLoaded>
                <UiThemeProvider theme="platform">
                    <VariablePanelContextProvider variables={variables}>
                        <LeftPanel
                            variables={variables}
                            selectedLayout={mockLayout}
                            layouts={mockLayouts}
                            layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                            layoutSectionUIOptions={{
                                visible: false,
                                layoutSwitcherVisible: false,
                                title: 'Layout',
                            }}
                        />
                    </VariablePanelContextProvider>
                </UiThemeProvider>
            </AppProvider>,
            { container: document.body.appendChild(APP_WRAPPER) },
        );
        const imagePicker = await screen.findAllByTestId(getDataTestId('image-picker-content'));

        await act(async () => {
            await user.click(imagePicker[0]);
        });

        const image = await screen.findAllByRole('img', { name: /grafx/i });
        expect(image[0]).toBeInTheDocument();

        await act(async () => {
            await user.click(image[0]);
        });

        const input = getByTestId(getDataTestIdForSUI('media-panel-search-input'));
        expect(input).toBeInTheDocument();
    });
});
