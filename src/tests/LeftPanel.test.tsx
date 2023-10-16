import { getDataTestId } from '@chili-publish/grafx-shared-components';
import EditorSDK from '@chili-publish/studio-sdk';
import { render, waitFor } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import { act } from 'react-dom/test-utils';
import LeftPanel from '../components/layout-panels/leftPanel/LeftPanel';
import { VariablePanelContextProvider } from '../contexts/VariablePanelContext';
import { mockAssets } from './mocks/mockAssets';
import { mockConnectors } from './mocks/mockConnectors';
import { variables } from './mocks/mockVariables';

beforeEach(() => {
    jest.mock('@chili-publish/studio-sdk');
    const mockSDK = mock<EditorSDK>();
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

    mockSDK.mediaConnector.getCapabilities = jest
        .fn()
        .mockImplementation()
        .mockReturnValue(
            Promise.resolve({
                parsedData: { copy: false, detail: true, filtering: true, query: true, remove: false, upload: false },
            }),
        );

    mockSDK.fontConnector.getCapabilities = jest
        .fn()
        .mockImplementation()
        .mockReturnValue(
            Promise.resolve({
                parsedData: { copy: false, detail: true, filtering: true, query: true, remove: false, upload: false },
            }),
        );

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
            <VariablePanelContextProvider connectors={mockConnectors}>
                <LeftPanel variables={variables} isDocumentLoaded />
            </VariablePanelContextProvider>,
        );
        const imagePicker = await waitFor(() => getAllByTestId(getDataTestId('image-picker-content'))[0]);
        expect(imagePicker).toBeInTheDocument();

        await act(async () => {
            imagePicker.click();
        });

        const imagePanel = await getByText(/home/i);
        expect(imagePanel).toBeInTheDocument();

        const goBackButton = getByRole('button');
        expect(goBackButton).toBeInTheDocument();

        await act(async () => {
            goBackButton.click();
        });

        expect(getByText('Customize')).toBeInTheDocument();
    });

    test('Media assets are correctly fetched', async () => {
        const { getAllByTestId, getByRole, getByText } = render(
            <VariablePanelContextProvider connectors={mockConnectors}>
                <LeftPanel variables={variables} isDocumentLoaded />
            </VariablePanelContextProvider>,
        );
        const imagePicker = await waitFor(() => getAllByTestId(getDataTestId('image-picker-content'))[0]);
        await act(async () => {
            imagePicker.click();
        });

        const folder = getByRole('img', { name: /grafx/i });
        expect(folder).toBeInTheDocument();
        const image = getByText(mockAssets[1].name);
        expect(image).toBeInTheDocument();
    });

    test('Media asset folder navigation works', async () => {
        const { getAllByTestId, getByRole, getByText } = render(
            <VariablePanelContextProvider connectors={mockConnectors}>
                <LeftPanel variables={variables} isDocumentLoaded />
            </VariablePanelContextProvider>,
        );
        const imagePicker = await waitFor(() => getAllByTestId(getDataTestId('image-picker-content'))[0]);
        await act(async () => {
            imagePicker.click();
        });
        const image = getByRole('img', { name: /grafx/i });

        await act(async () => {
            image.click();
        });

        const breadCrumb = getByText('Home');
        expect(breadCrumb).toBeInTheDocument();
    });

    test.skip('Image Picker updates image after asset is selected', async () => {
        const { getAllByTestId, getByRole } = render(
            <VariablePanelContextProvider connectors={mockConnectors}>
                <LeftPanel variables={variables} isDocumentLoaded />
            </VariablePanelContextProvider>,
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
});
