import { getDataTestId } from '@chili-publish/grafx-shared-components';
import EditorSDK, { LayoutPropertiesType } from '@chili-publish/studio-sdk';
import { mockAssets } from '@mocks/mockAssets';
import { mockLayout, mockLayouts } from '@mocks/mockLayout';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import { FormBuilderArray, ProjectConfig, UserInterfaceWithOutputSettings } from 'src/types/types';
import { transformFormBuilderArrayToObject } from 'src/utils/helpers';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { UiConfigContextProvider } from 'src/contexts/UiConfigContext';
import LeftPanel from '../components/layout-panels/leftPanel/LeftPanel';
import AppProvider from '../contexts/AppProvider';
import { getDataTestIdForSUI } from '../utils/dataIds';
import { APP_WRAPPER } from './mocks/app';
import { variables } from './mocks/mockVariables';
import { ProjectConfigs } from './mocks/MockProjectConfig';
import { renderWithProviders } from './mocks/Provider';
import { setupStore } from '../store';
import { setVariables } from '../store/reducers/variableReducer';
import { showVariablesPanel } from '../store/reducers/panelReducer';
import * as panelReducer from '../store/reducers/panelReducer';

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
            }) as any,
    );

    jest.spyOn(panelReducer, 'showVariablesPanel');
});

afterEach(() => {
    jest.clearAllMocks();
});

const formBuilder = transformFormBuilderArrayToObject(mockUserInterface.formBuilder as FormBuilderArray);
const projectConfig = {
    ...ProjectConfigs.empty,
    onFetchOutputSettings: () =>
        Promise.resolve({
            userInterface: { id: '1', name: 'name' },
            outputSettings: [{ ...mockOutputSetting, layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'] }],
            formBuilder,
            outputSettingsFullList: [],
        } as UserInterfaceWithOutputSettings),
    onFetchUserInterfaceDetails: () =>
        Promise.resolve({
            userInterface: { id: '1', name: 'name' },
            outputSettings: [{ ...mockOutputSetting, layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'] }],
            formBuilder,
            outputSettingsFullList: [],
        } as UserInterfaceWithOutputSettings),
    uiOptions: {
        ...ProjectConfigs.empty.uiOptions,
    },
};
describe('Image Panel', () => {
    const reduxStore = setupStore();

    beforeEach(() => {
        reduxStore.dispatch(setVariables(variables));
        reduxStore.dispatch(showVariablesPanel());
    });

    test('Navigation to and from image panel works', async () => {
        const user = userEvent.setup();
        const { getByText, getByRole } = renderWithProviders(
            <AppProvider isDocumentLoaded>
                <UiConfigContextProvider projectConfig={projectConfig as ProjectConfig}>
                    <LeftPanel
                        selectedLayout={mockLayout}
                        layouts={mockLayouts}
                        layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                        layoutSectionUIOptions={{
                            visible: false,
                            layoutSwitcherVisible: false,
                            title: 'Layout',
                        }}
                    />
                </UiConfigContextProvider>
            </AppProvider>,
            { container: document.body.appendChild(APP_WRAPPER), reduxStore },
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
        const { getByText, getByTestId, getAllByText } = renderWithProviders(
            <AppProvider isDocumentLoaded>
                <LeftPanel
                    selectedLayout={mockLayout}
                    layouts={mockLayouts}
                    layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                    layoutSectionUIOptions={{
                        visible: false,
                        layoutSwitcherVisible: false,
                        title: 'Layout',
                    }}
                />
            </AppProvider>,
            { container: document.body.appendChild(APP_WRAPPER), reduxStore },
        );
        const imagePicker = await screen.findAllByTestId(getDataTestId('image-picker-content'));

        await user.click(imagePicker[0]);

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
        const { getByText } = renderWithProviders(
            <AppProvider isDocumentLoaded>
                <LeftPanel
                    selectedLayout={mockLayout}
                    layouts={mockLayouts}
                    layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                    layoutSectionUIOptions={{
                        visible: false,
                        layoutSwitcherVisible: false,
                        title: 'Layout',
                    }}
                />
            </AppProvider>,
            { container: document.body.appendChild(APP_WRAPPER), reduxStore },
        );
        await waitFor(() => {
            expect(screen.getAllByTestId(getDataTestId('image-picker-content'))).not.toHaveLength(0);
        });

        const imagePicker = await screen.findAllByTestId(getDataTestId('image-picker-content'));
        await user.click(imagePicker[0]);

        const image = (await screen.findAllByRole('img', { name: /grafx/i }))[0];

        await user.click(image);
        const breadCrumb = getByText('Home');
        expect(breadCrumb).toBeInTheDocument();
    });

    test.skip('Image Picker updates image after asset is selected', async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <AppProvider isDocumentLoaded>
                <LeftPanel
                    selectedLayout={mockLayout}
                    layouts={mockLayouts}
                    layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                    layoutSectionUIOptions={{
                        visible: false,
                        layoutSwitcherVisible: false,
                        title: 'Layout',
                    }}
                />
            </AppProvider>,
            { reduxStore },
        );
        const imagePicker = await screen.findAllByTestId(getDataTestId('image-picker-content'));
        await user.click(imagePicker[0]);

        const image = await screen.findByRole('img', { name: mockAssets[1].name });

        await user.click(image);

        expect(window.StudioUISDK.variable.setImageVariableConnector).toHaveBeenCalledTimes(1);
        expect(window.StudioUISDK.variable.setValue).toHaveBeenCalledTimes(1);
    });
    test('Do not renderWithProviders search input when filtering is not supported', async () => {
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

        renderWithProviders(
            <AppProvider isDocumentLoaded>
                <LeftPanel
                    selectedLayout={mockLayout}
                    layouts={mockLayouts}
                    layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                    layoutSectionUIOptions={{
                        visible: false,
                        layoutSwitcherVisible: false,
                        title: 'Layout',
                    }}
                />
            </AppProvider>,
            { container: document.body.appendChild(APP_WRAPPER), reduxStore },
        );
        await waitFor(() => {
            expect(screen.getAllByTestId(getDataTestId('image-picker-content'))).not.toHaveLength(0);
        });
        const imagePicker = await screen.findAllByTestId(getDataTestId('image-picker-content'));
        await user.click(imagePicker[0]);

        const image = await screen.findAllByRole('img', { name: /grafx/i });
        expect(image[0]).toBeInTheDocument();

        await user.click(image[0]);

        await waitFor(() => {
            expect(panelReducer.showVariablesPanel).toHaveBeenCalledTimes(1);
        });
    });
    test('renderWithProviders search input when filtering is supported', async () => {
        const user = userEvent.setup();
        const { getByTestId } = renderWithProviders(
            <AppProvider isDocumentLoaded>
                <LeftPanel
                    selectedLayout={mockLayout}
                    layouts={mockLayouts}
                    layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                    layoutSectionUIOptions={{
                        visible: false,
                        layoutSwitcherVisible: false,
                        title: 'Layout',
                    }}
                />
            </AppProvider>,
            { container: document.body.appendChild(APP_WRAPPER), reduxStore },
        );
        const imagePicker = await screen.findAllByTestId(getDataTestId('image-picker-content'));

        await user.click(imagePicker[0]);

        const image = await screen.findAllByRole('img');
        expect(image[0]).toBeInTheDocument();

        await user.click(image[0]);

        const input = getByTestId(getDataTestIdForSUI('media-panel-search-input'));
        expect(input).toBeInTheDocument();
    });
});
