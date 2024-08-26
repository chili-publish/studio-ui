import { UiThemeProvider, getDataTestId } from '@chili-publish/grafx-shared-components';
import EditorSDK from '@chili-publish/studio-sdk';
import { render, waitFor, screen } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import { act } from 'react-dom/test-utils';
import LeftPanel from '../components/layout-panels/leftPanel/LeftPanel';
import { VariablePanelContextProvider } from '../contexts/VariablePanelContext';
import { mockAssets } from './mocks/mockAssets';
import { mockConnectors } from './mocks/mockConnectors';
import { variables } from './mocks/mockVariables';
import { getDataTestIdForSUI } from '../utils/dataIds';
import userEvent from '@testing-library/user-event';

jest.mock('@chili-publish/studio-sdk');
jest.mock('../components/variablesComponents/imageVariable/useVariableConnector', () => ({
    useVariableConnector: () => ({
        selectedConnector: {
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
            new Promise((resolve) => {
                const stringData = JSON.stringify({ pageSize: 2, data: mockAssets });
                // eslint-disable-next-line no-promise-executor-return
                return resolve({
                    success: true,
                    status: 0,
                    data: stringData,
                    parsedData: {
                        pageSize: 2,
                        data: mockAssets,
                    },
                });
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

    window.SDK = mockSDK;

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
        const { getAllByTestId, getByText, getByRole } = render(
            <UiThemeProvider theme="platform">
                <VariablePanelContextProvider connectors={mockConnectors} variables={variables}>
                    <LeftPanel variables={variables} isDocumentLoaded />
                </VariablePanelContextProvider>
            </UiThemeProvider>,
        );
        const imagePicker = await waitFor(() => getAllByTestId(getDataTestId('image-picker-content'))[0]);
        expect(imagePicker).toBeInTheDocument();

        await act(async () => {
            imagePicker.click();
        });

        // const imagePanel = await getByText(/home/i);
        // expect(imagePanel).toBeInTheDocument();

        const goBackButton = getByRole('button');
        expect(goBackButton).toBeInTheDocument();

        await act(async () => {
            goBackButton.click();
        });

        expect(getByText('Customize')).toBeInTheDocument();
    });

    test('Media assets are correctly fetched', async () => {
        const { getByText, getByTestId, getAllByTestId, getAllByRole, getAllByText } = render(
            <UiThemeProvider theme="platform">
                <VariablePanelContextProvider connectors={mockConnectors} variables={variables}>
                    <LeftPanel variables={variables} isDocumentLoaded />
                </VariablePanelContextProvider>
            </UiThemeProvider>,
        );
        const imagePicker = await waitFor(() => getAllByTestId(getDataTestId('image-picker-content'))[0]);
        await act(async () => {
            imagePicker.click();
        });

        await waitFor(() => {
            const folder = getAllByRole('img', { name: /grafx/i })[0];
            expect(folder).toBeInTheDocument();
        });

        const container = getByTestId(getDataTestIdForSUI('resources-container'));
        // includes one the placeholder element used for getting next page (2 elements returned by the API and 1 placeholder div)
        expect(container.childNodes).toHaveLength(3);

        expect(getAllByText(/grafx/i)).not.toHaveLength(0);
        expect(getByText('ProductShot')).toBeInTheDocument();
        expect(getByText('grafx')).toBeInTheDocument();
    });

    test('Media asset folder navigation works', async () => {
        const { getAllByTestId, getByText } = render(
            <UiThemeProvider theme="platform">
                <VariablePanelContextProvider connectors={mockConnectors} variables={variables}>
                    <LeftPanel variables={variables} isDocumentLoaded />
                </VariablePanelContextProvider>
            </UiThemeProvider>,
        );
        const imagePicker = await waitFor(() => getAllByTestId(getDataTestId('image-picker-content'))[0]);
        await act(async () => {
            imagePicker.click();
        });

        const image = (await screen.findAllByRole('img', { name: /grafx/i }))[0];

        await act(async () => {
            image.click();
        });

        const breadCrumb = getByText('Home');
        expect(breadCrumb).toBeInTheDocument();
    });

    test.skip('Image Picker updates image after asset is selected', async () => {
        const { getAllByTestId, getByRole } = render(
            <UiThemeProvider theme="platform">
                <VariablePanelContextProvider connectors={mockConnectors} variables={variables}>
                    <LeftPanel variables={variables} isDocumentLoaded />
                </VariablePanelContextProvider>
            </UiThemeProvider>,
        );
        const imagePicker = await waitFor(() => getAllByTestId(getDataTestId('image-picker-content'))[0]);
        await act(async () => {
            imagePicker.click();
        });
        const image = getByRole('img', { name: mockAssets[1].name });

        await act(async () => {
            image.click();
        });

        expect(window.SDK.variable.setImageVariableConnector).toBeCalledTimes(1);
        expect(window.SDK.variable.setValue).toBeCalledTimes(1);
    });
    test('Do not render search input when filtering is not supported', async () => {
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

        const { getAllByTestId, getAllByRole } = render(
            <UiThemeProvider theme="platform">
                <VariablePanelContextProvider connectors={mockConnectors} variables={variables}>
                    <LeftPanel variables={variables} isDocumentLoaded />
                </VariablePanelContextProvider>
            </UiThemeProvider>,
        );
        const imagePicker = await waitFor(() => getAllByTestId(getDataTestId('image-picker-content'))[0]);
        await act(async () => {
            imagePicker.click();
        });
        let image: HTMLElement;
        await waitFor(() => {
            [image] = getAllByRole('img', { name: /grafx/i });
            expect(image).toBeInTheDocument();
        });

        await act(async () => {
            image?.click();
        });

        const input = screen.queryByTestId(getDataTestIdForSUI('media-panel-search-input'));
        expect(input).toBeNull();
    });
    test('Render search input when filtering is supported', async () => {
        const user = userEvent.setup();
        const { getAllByTestId, getAllByRole, getByTestId } = render(
            <UiThemeProvider theme="platform">
                <VariablePanelContextProvider connectors={mockConnectors} variables={variables}>
                    <LeftPanel variables={variables} isDocumentLoaded />
                </VariablePanelContextProvider>
            </UiThemeProvider>,
        );
        const imagePicker = await waitFor(() => getAllByTestId(getDataTestId('image-picker-content'))[0]);

        await user.click(imagePicker);

        let image: HTMLElement;
        await waitFor(() => {
            [image] = getAllByRole('img', { name: /grafx/i });
            expect(image).toBeInTheDocument();
        });

        await act(async () => {
            image?.click();
        });

        const input = getByTestId(getDataTestIdForSUI('media-panel-search-input'));
        expect(input).toBeInTheDocument();
    });
});
