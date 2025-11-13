import EditorSDK, { ConnectorRegistrationSource, LayoutIntent, LayoutPropertiesType } from '@chili-publish/studio-sdk';
import { ConnectorInstance } from '@chili-publish/studio-sdk/lib/src/next';
import { mockLayout, mockLayouts } from '@mocks/mockLayout';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import { UiConfigContextProvider } from 'src/contexts/UiConfigContext';
import { FormBuilderArray, ProjectConfig, UserInterfaceWithOutputSettings } from 'src/types/types';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { setupStore } from 'src/store';
import { setVariables } from 'src/store/reducers/variableReducer';
import { showDatePickerPanel, showVariablesPanel } from 'src/store/reducers/panelReducer';
import { UserInterfaceDetailsContextProvider } from 'src/components/navbar/UserInterfaceDetailsContext';
import { mockAssets } from '@mocks/mockAssets';
import { transformFormBuilderArrayToObject } from 'src/utils/helpers';
import MobileVariables from '../components/variables/mobileVariables/MobileVariables';
import AppProvider from '../contexts/AppProvider';
import { APP_WRAPPER } from './mocks/app';
import { ProjectConfigs } from './mocks/MockProjectConfig';
import { renderWithProviders } from './mocks/Provider';
import { variables } from './mocks/mockVariables';

jest.mock('@chili-publish/studio-sdk');

const mockSDK = mock<EditorSDK>();
const mockDataSource = {
    id: 'data-source',
    name: 'Goodle sheets',
    iconUrl: '',
    source: { source: ConnectorRegistrationSource.url, url: '' },
} as ConnectorInstance;

jest.mock('../components/variablesComponents/imageVariable/useVariableConnector', () => ({
    useVariableConnector: () => ({
        remoteConnector: {
            id: 'connector-id',
            type: 'media',
            scriptSource: 'defaultMedia',
            supportedAuthentication: {
                browser: ['none'],
            },
        },
    }),
}));

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
            parsedData: {
                copy: false,
                detail: true,
                filtering: true,
                query: true,
                remove: false,
                upload: false,
            },
        }),
    );

mockSDK.connector.getMappings = jest.fn().mockResolvedValue({
    parsedData: null,
});
mockSDK.variable.getAll = jest.fn().mockResolvedValue({
    parsedData: null,
});
mockSDK.layout.select = jest.fn().mockResolvedValue({
    parsedData: null,
});
mockSDK.dataConnector.getPage = jest.fn().mockResolvedValue({
    parsedData: { page: { data: [] } },
});
mockSDK.undoManager.addCustomData = jest.fn();
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
mockSDK.next.connector = {} as any;

mockSDK.next.connector.getById = jest.fn().mockResolvedValue({
    parsedData: {
        source: { url: 'http://deploy.com/data-connector', source: ConnectorRegistrationSource.url },
    },
});

window.IntersectionObserver = jest.fn(
    () =>
        ({
            observe: jest.fn(),
            unobserve: jest.fn(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any,
);

window.StudioUISDK = mockSDK;
describe('Mobile Tray Header', () => {
    const reduxStore = setupStore();

    beforeEach(() => {
        reduxStore.dispatch(setVariables(variables));
        reduxStore.dispatch(showVariablesPanel());
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    const user = userEvent.setup();

    const mockFormBuilder = transformFormBuilderArrayToObject(mockUserInterface.formBuilder as FormBuilderArray);
    const projectConfig: ProjectConfig = {
        ...ProjectConfigs.empty,
        onFetchUserInterfaceDetails: () =>
            Promise.resolve({
                userInterface: { id: '1', name: 'name' },
                outputSettings: [
                    { ...mockOutputSetting, layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'] },
                ],
                formBuilder: mockFormBuilder,
                outputSettingsFullList: [],
            } as unknown as UserInterfaceWithOutputSettings),
    };

    it('Layouts header is available when no data source is available', async () => {
        renderWithProviders(
            <AppProvider isDocumentLoaded dataSource={undefined}>
                <UiConfigContextProvider projectConfig={projectConfig}>
                    <UserInterfaceDetailsContextProvider
                        projectConfig={projectConfig as ProjectConfig}
                        layoutIntent={LayoutIntent.print}
                    >
                        <MobileVariables
                            selectedLayout={mockLayout}
                            layouts={mockLayouts}
                            layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                            layoutSectionUIOptions={{
                                visible: true,
                            }}
                        />
                    </UserInterfaceDetailsContextProvider>
                </UiConfigContextProvider>
            </AppProvider>,
            { container: document.body.appendChild(APP_WRAPPER), reduxStore },
        );

        const openTrayBtn = screen.getByRole('button');

        await user.click(openTrayBtn);
        await waitFor(() => {
            const header = screen.getByTestId('test-gsc-tray-header');
            expect(header).toBeInTheDocument();
            within(header).getByRole('heading', { name: mockFormBuilder?.layouts.header });
        });

        const dropdown = screen.getByTestId('sui-dropdown-available-layout');

        expect(dropdown).toBeInTheDocument();
        await user.click(dropdown);
        await waitFor(() => {
            const header = screen.getByTestId('test-gsc-tray-header');
            expect(header).toBeInTheDocument();
            within(header).getByRole('heading', { name: mockFormBuilder?.layouts.header });
        });
    });

    it('Data source is the title of the tray when available', async () => {
        renderWithProviders(
            <AppProvider isDocumentLoaded dataSource={mockDataSource}>
                <UiConfigContextProvider projectConfig={projectConfig}>
                    <UserInterfaceDetailsContextProvider
                        projectConfig={projectConfig as ProjectConfig}
                        layoutIntent={LayoutIntent.print}
                    >
                        <MobileVariables
                            selectedLayout={mockLayout}
                            layouts={mockLayouts}
                            layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                            layoutSectionUIOptions={{
                                visible: true,
                            }}
                        />
                    </UserInterfaceDetailsContextProvider>
                </UiConfigContextProvider>
            </AppProvider>,
            { container: document.body.appendChild(APP_WRAPPER), reduxStore },
        );

        const openTrayBtn = screen.getByRole('button');

        await user.click(openTrayBtn);

        await waitFor(() => {
            const header = screen.getByTestId('test-gsc-tray-header');
            expect(header).toBeInTheDocument();
            within(header).getByRole('heading', {
                name: mockFormBuilder?.datasource.header,
            });
        });

        const dataSourceInput = screen.getByRole('textbox', {
            name: /data-source-input/i,
        });
        expect(dataSourceInput).toBeInTheDocument();

        await user.click(dataSourceInput);
        await waitFor(() => {
            const header = screen.getByTestId('test-gsc-tray-header');
            expect(header).toBeInTheDocument();
            within(header).getByRole('heading', {
                name: mockFormBuilder?.datasource.header,
            });
        });
    });

    it('Select date is the title when date picker is selected', async () => {
        renderWithProviders(
            <AppProvider isDocumentLoaded dataSource={mockDataSource}>
                <UiConfigContextProvider projectConfig={projectConfig}>
                    <UserInterfaceDetailsContextProvider
                        projectConfig={projectConfig as ProjectConfig}
                        layoutIntent={LayoutIntent.print}
                    >
                        <MobileVariables
                            selectedLayout={mockLayout}
                            layouts={mockLayouts}
                            layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                            layoutSectionUIOptions={{
                                visible: true,
                            }}
                        />
                    </UserInterfaceDetailsContextProvider>
                </UiConfigContextProvider>
            </AppProvider>,
            { container: document.body.appendChild(APP_WRAPPER), reduxStore },
        );
        reduxStore.dispatch(showVariablesPanel());

        const openTrayBtn = screen.getByRole('button');

        await user.click(openTrayBtn);
        await waitFor(() => {
            const header = screen.getByTestId('test-gsc-tray-header');
            expect(header).toBeInTheDocument();
            within(header).getByRole('heading', { name: /data source/i });
        });
        const datePickerBtn = screen.getByTestId('test-sui-date-variable-variable-date-picker');
        expect(datePickerBtn).toBeInTheDocument();
        const input = within(datePickerBtn).getByRole('textbox');
        expect(input).toBeInTheDocument();
        await user.click(input);
        await act(() => {
            reduxStore.dispatch(showDatePickerPanel({ variableId: 'date-variable' }));
        });
        await waitFor(() => {
            const header = screen.getByTestId('test-gsc-tray-header');
            expect(header).toBeInTheDocument();
            within(header).getByRole('heading', { name: /select date/i });
        });
    });
    it('Select image is the title when image input is selected', async () => {
        renderWithProviders(
            <AppProvider isDocumentLoaded dataSource={mockDataSource}>
                <UiConfigContextProvider projectConfig={projectConfig}>
                    <UserInterfaceDetailsContextProvider
                        projectConfig={projectConfig as ProjectConfig}
                        layoutIntent={LayoutIntent.print}
                    >
                        <MobileVariables
                            selectedLayout={mockLayout}
                            layouts={mockLayouts}
                            layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                            layoutSectionUIOptions={{
                                visible: true,
                            }}
                        />
                    </UserInterfaceDetailsContextProvider>
                </UiConfigContextProvider>
            </AppProvider>,
            { container: document.body.appendChild(APP_WRAPPER), reduxStore },
        );

        const openTrayBtn = screen.getByRole('button');

        await user.click(openTrayBtn);
        await waitFor(() => {
            const header = screen.getByTestId('test-gsc-tray-header');
            expect(header).toBeInTheDocument();
            within(header).getByRole('heading', { name: /data source/i });
        });
        const imagePickerInput = screen.getByTestId('test-sui-img-picker-variable1');

        const image = within(imagePickerInput).getByRole('img', {
            hidden: true,
        });
        expect(image).toBeInTheDocument();
        await user.click(image);

        await waitFor(() => {
            const header = screen.getByTestId('test-gsc-tray-header');
            expect(header).toBeInTheDocument();
            within(header).getByText(/select image/i);
        });
    });
});
