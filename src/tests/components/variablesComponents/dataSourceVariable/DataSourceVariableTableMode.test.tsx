import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    DataSourceVariable,
    DataSourceVariableSourceType,
    VariableType,
    VariableVisibilityType,
} from '@chili-publish/studio-sdk';
import { useState } from 'react';
import { APP_WRAPPER } from '@tests/mocks/app';
import { renderWithProviders } from '@tests/mocks/Provider';
import DataSourceVariableTableMode from '../../../../components/variablesComponents/dataSourceVariable/DataSourceTableMode';
import { APP_WRAPPER_ID } from '../../../../utils/constants';
import { PanelType } from '../../../../store/reducers/panelReducer';
import { RootState } from '../../../../store';

jest.mock('../../../../utils/connectors', () => ({
    getRemoteConnector: jest.fn().mockResolvedValue({
        supportedAuthentication: {
            browser: [],
        },
    }),
    isAuthenticationRequired: jest.requireActual('../../../../utils/connectors').isAuthenticationRequired,
}));

jest.mock('../../../../contexts/UiConfigContext', () => ({
    useUiConfigContext: jest.fn().mockReturnValue({
        projectConfig: {},
        graFxStudioEnvironmentApiBaseUrl: 'https://test.example.com',
        onVariableFocus: jest.fn(),
        onVariableBlur: jest.fn(),
    }),
}));

const mockUseMobileSize = jest.fn().mockReturnValue(false);

jest.mock('@chili-publish/grafx-shared-components', () => ({
    ...jest.requireActual('@chili-publish/grafx-shared-components'),
    useMobileSize: () => mockUseMobileSize(),
}));

const { useUiConfigContext } = jest.requireMock('../../../../contexts/UiConfigContext');

const mockOnVariableFocus = jest.fn();
const mockOnVariableBlur = jest.fn();

const INJECTED_MODEL = [
    { name: 'id', type: 'singleLine' as const },
    { name: 'name', type: 'singleLine' as const },
    { name: 'age', type: 'singleLine' as const },
];

const createVariable = (overrides: Partial<DataSourceVariable> = {}): DataSourceVariable =>
    ({
        id: 'ds-var-1',
        name: 'DataSourceVar',
        label: 'My Data Source',
        type: VariableType.dataSource,
        value: { connectorId: 'connector-1', type: DataSourceVariableSourceType.connector },
        isReadonly: false,
        isRequired: false,
        isVisible: true,
        visibility: { type: VariableVisibilityType.visible },
        parentId: '',
        occurrences: 0,
        privateData: {},
        helpText: '',
        placeholder: '',
        ...overrides,
    }) as DataSourceVariable;

const createInjectedVariable = (overrides: Partial<DataSourceVariable> = {}): DataSourceVariable =>
    createVariable({
        value: {
            type: DataSourceVariableSourceType.injected,
            model: INJECTED_MODEL,
            itemIdPropertyName: 'id',
        },
        ...overrides,
    });

const defaultPageData = [
    { id: '1', name: 'Joe', age: 15 },
    { id: '2', name: 'John', age: 18 },
];

function getPreloadedState(panelType: PanelType = PanelType.DEFAULT): Partial<RootState> {
    return {
        panel: { activePanel: panelType },
        direction: { direction: 'ltr' },
    } as Partial<RootState>;
}

let injectedDataChangedHandler: ((variableId: string) => void) | undefined;

function setupSDKMocks(
    pageData: Record<string, unknown>[] = defaultPageData,
    options: { continuationToken?: string | null; modelKey?: string; sourceType?: 'connector' | 'injected' } = {},
) {
    const { continuationToken = null, modelKey = 'id', sourceType = 'connector' } = options;

    window.StudioUISDK.dataConnector.getModel = jest.fn().mockResolvedValue({
        parsedData: { itemIdPropertyName: modelKey },
    });

    window.StudioUISDK.dataConnector.getPage = jest.fn().mockResolvedValue({
        parsedData: {
            data: pageData,
            continuationToken,
        },
    });

    window.StudioUISDK.dataConnector.getPageItemById = jest.fn().mockResolvedValue({
        parsedData: {
            data: pageData[0] ?? null,
            continuationToken: null,
        },
    });

    const injectedDataSourceMocks =
        sourceType === 'injected'
            ? {
                  getInjectedData: jest.fn().mockResolvedValue({
                      parsedData: {
                          data: pageData,
                          continuationToken,
                          previousPageToken: null,
                      },
                  }),
                  getInjectedItemById: jest.fn().mockResolvedValue({
                      parsedData: {
                          data: pageData[0] ?? null,
                          continuationToken: null,
                          previousPageToken: null,
                      },
                  }),
              }
            : {};

    window.StudioUISDK.variable.dataSource = {
        setValue: jest.fn().mockResolvedValue(undefined),
        ...injectedDataSourceMocks,
    } as never;

    injectedDataChangedHandler = undefined;
    window.StudioUISDK.config = {
        events: {
            onConnectorEvent: {
                registerCallback: jest.fn().mockReturnValue(jest.fn()),
            },
            onInjectedDataChanged: {
                registerCallback: jest.fn().mockImplementation((cb: (variableId: string) => void) => {
                    injectedDataChangedHandler = cb;
                    return jest.fn();
                }),
            },
        },
    } as never;
}

function renderComponent(
    variable: DataSourceVariable,
    validationError: string | undefined,
    panelType: PanelType = PanelType.DEFAULT,
) {
    const container = document.body.appendChild(APP_WRAPPER.cloneNode(true) as HTMLElement);
    return renderWithProviders(
        <div id={APP_WRAPPER_ID}>
            <DataSourceVariableTableMode variable={variable} validationError={validationError} />
        </div>,
        { preloadedState: getPreloadedState(panelType), container },
    );
}

describe('DataSourceVariableTableMode', () => {
    const user = userEvent.setup();

    beforeAll(() => {
        window.IntersectionObserver = jest.fn(
            () =>
                ({
                    observe: jest.fn(),
                    unobserve: jest.fn(),
                    disconnect: jest.fn(),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                }) as any,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseMobileSize.mockReturnValue(false);
        useUiConfigContext.mockReturnValue({
            projectConfig: {},
            graFxStudioEnvironmentApiBaseUrl: 'https://test.example.com',
            onVariableFocus: mockOnVariableFocus,
            onVariableBlur: mockOnVariableBlur,
        });
        setupSDKMocks();
    });

    describe('rendering', () => {
        it('renders DataSourceInput with current row data when connector is configured', async () => {
            renderComponent(createVariable(), undefined);

            expect(await screen.findByDisplayValue('1 | Joe | 15')).toBeInTheDocument();
        });

        it('uses variable label for input label', async () => {
            renderComponent(createVariable(), undefined);

            await screen.findByDisplayValue('1 | Joe | 15');
            expect(screen.getByText('My Data Source')).toBeInTheDocument();
        });

        it('falls back to variable name when label is not set', async () => {
            renderComponent(createVariable({ label: undefined }), undefined);

            await screen.findByDisplayValue('1 | Joe | 15');
            expect(screen.getByText('DataSourceVar')).toBeInTheDocument();
        });

        it('uses variable placeholder when set', async () => {
            setupSDKMocks([]);
            renderComponent(createVariable({ placeholder: 'Choose a record' }), undefined);

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Choose a record')).toBeInTheDocument();
            });
        });
    });

    describe('help text', () => {
        it('displays help text when present and no validation error', async () => {
            renderComponent(createVariable({ helpText: 'Select a row to use' }), undefined);

            await screen.findByDisplayValue('1 | Joe | 15');
            expect(screen.getByText('Select a row to use')).toBeInTheDocument();
        });

        it('hides help text when validation error is present', async () => {
            renderComponent(createVariable({ helpText: 'Select a row to use' }), 'Field is required');

            await screen.findByDisplayValue('1 | Joe | 15');
            expect(screen.queryByText('Select a row to use')).not.toBeInTheDocument();
        });
    });

    describe('desktop interactions', () => {
        it('opens modal with data table on input click', async () => {
            renderComponent(createVariable(), undefined);

            const input = await screen.findByDisplayValue('1 | Joe | 15');
            await user.click(input);

            await waitFor(() => {
                expect(screen.getByText('Data Source')).toBeInTheDocument();
            });

            const table = screen.getByRole('table');
            expect(table).toBeInTheDocument();

            const rows = within(table).getAllByRole('row');
            const [header, ...dataRows] = rows;
            expect(within(header).getByText('id')).toBeInTheDocument();
            expect(within(header).getByText('name')).toBeInTheDocument();
            expect(within(header).getByText('age')).toBeInTheDocument();
            expect(dataRows).toHaveLength(2);

            expect(mockOnVariableFocus).toHaveBeenCalledWith('ds-var-1');
        });

        it('calls onVariableBlur on modal close', async () => {
            renderComponent(createVariable(), undefined);

            const input = await screen.findByDisplayValue('1 | Joe | 15');
            await user.click(input);

            await waitFor(() => {
                expect(screen.getByText('Data Source')).toBeInTheDocument();
            });

            const closeButton = screen.getByTestId('test-gsc-modal-close-action-button');
            await user.click(closeButton);

            await waitFor(() => {
                expect(mockOnVariableBlur).toHaveBeenCalledWith('ds-var-1');
            });
        });

        it('navigates to next row when next button is clicked', async () => {
            renderComponent(createVariable(), undefined);

            await screen.findByDisplayValue('1 | Joe | 15');
            await user.click(screen.getByTestId('test-sui-data-row-next'));

            expect(await screen.findByDisplayValue('2 | John | 18')).toBeInTheDocument();
        });

        it('navigates to previous row when prev button is clicked', async () => {
            renderComponent(createVariable(), undefined);

            await screen.findByDisplayValue('1 | Joe | 15');
            await user.click(screen.getByTestId('test-sui-data-row-next'));
            await screen.findByDisplayValue('2 | John | 18');

            await user.click(screen.getByTestId('test-sui-data-row-prev'));
            expect(await screen.findByDisplayValue('1 | Joe | 15')).toBeInTheDocument();
        });

        it('disables prev button on first row without previous page', async () => {
            renderComponent(createVariable(), undefined);

            await screen.findByDisplayValue('1 | Joe | 15');
            expect(screen.getByTestId('test-sui-data-row-prev')).toBeDisabled();
        });

        it('disables next button on last row without next page', async () => {
            renderComponent(createVariable(), undefined);

            await screen.findByDisplayValue('1 | Joe | 15');
            await user.click(screen.getByTestId('test-sui-data-row-next'));
            await screen.findByDisplayValue('2 | John | 18');

            expect(screen.getByTestId('test-sui-data-row-next')).toBeDisabled();
        });
    });

    describe('data loading', () => {
        it('calls getPage to load initial data', async () => {
            renderComponent(createVariable(), undefined);

            await screen.findByDisplayValue('1 | Joe | 15');
            expect(window.StudioUISDK.dataConnector.getPage).toHaveBeenCalledWith(
                'connector-1',
                expect.objectContaining({ continuationToken: null }),
            );
        });

        it('calls getModel to fetch the key property name', async () => {
            renderComponent(createVariable(), undefined);

            await screen.findByDisplayValue('1 | Joe | 15');
            expect(window.StudioUISDK.dataConnector.getModel).toHaveBeenCalledWith('connector-1');
        });

        it('loads preselected row when entryId is set', async () => {
            renderComponent(createVariable({ entryId: 'entry-1' }), undefined);

            await waitFor(() => {
                expect(window.StudioUISDK.dataConnector.getPageItemById).toHaveBeenCalledWith(
                    'connector-1',
                    'entry-1',
                    expect.objectContaining({ limit: 50 }),
                );
            });
        });

        it('shows error state when getPage rejects', async () => {
            window.StudioUISDK.dataConnector.getPage = jest.fn().mockRejectedValue(new Error('Network error'));
            renderComponent(createVariable(), undefined);

            await waitFor(() => {
                expect(window.StudioUISDK.dataConnector.getPage).toHaveBeenCalled();
            });
            expect(screen.getByRole('textbox')).toHaveValue('');
        });
    });

    describe('mobile behavior', () => {
        beforeEach(() => {
            mockUseMobileSize.mockReturnValue(true);
        });

        it('dispatches panel action on input click instead of opening modal', async () => {
            const { reduxStore } = renderComponent(createVariable(), undefined);

            const input = await screen.findByDisplayValue('1 | Joe | 15');
            await user.click(input);

            await waitFor(() => {
                const state = reduxStore.getState();
                expect(state.panel.activePanel).toBe(PanelType.DATA_SOURCE_VARIABLE_TABLE_MODE);
            });
            expect(screen.queryByText('Data Source')).not.toBeInTheDocument();
            expect(mockOnVariableFocus).toHaveBeenCalledWith('ds-var-1');
        });

        it('renders DataSourceTable when table mode panel is active', async () => {
            renderComponent(createVariable(), undefined, PanelType.DATA_SOURCE_VARIABLE_TABLE_MODE);

            await waitFor(() => {
                expect(screen.getByRole('table')).toBeInTheDocument();
            });

            const table = screen.getByRole('table');
            const rows = within(table).getAllByRole('row');
            const [header, ...dataRows] = rows;
            expect(within(header).getByText('id')).toBeInTheDocument();
            expect(dataRows).toHaveLength(2);
        });

        it('does not render modal when table mode panel is active', async () => {
            renderComponent(createVariable(), undefined, PanelType.DATA_SOURCE_VARIABLE_TABLE_MODE);

            await waitFor(() => {
                expect(screen.getByRole('table')).toBeInTheDocument();
            });
            expect(screen.queryByText('Data Source')).not.toBeInTheDocument();
        });

        it('renders DataSourceInput when panel is not table mode', async () => {
            renderComponent(createVariable(), undefined, PanelType.DEFAULT);

            expect(await screen.findByDisplayValue('1 | Joe | 15')).toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('injected data source', () => {
        beforeEach(() => {
            setupSDKMocks(defaultPageData, { sourceType: 'injected' });
        });

        it('does not call connector APIs on mount', async () => {
            renderComponent(createInjectedVariable(), undefined);

            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument();
            });

            expect(window.StudioUISDK.dataConnector.getPage).not.toHaveBeenCalled();
            expect(window.StudioUISDK.dataConnector.getModel).not.toHaveBeenCalled();
            expect(window.StudioUISDK.variable.dataSource.getInjectedData).not.toHaveBeenCalled();
        });

        it('loads injected data when the modal is opened without a preselected row', async () => {
            renderComponent(createInjectedVariable(), undefined);

            const input = await screen.findByRole('textbox');
            await user.click(input);

            await waitFor(() => {
                expect(window.StudioUISDK.variable.dataSource.getInjectedData).toHaveBeenCalledWith('ds-var-1');
            });

            const table = screen.getByRole('table');
            const rows = within(table).getAllByRole('row');
            expect(rows.length).toBeGreaterThan(1);
        });

        it('loads preselected injected row when the modal is opened with entryId', async () => {
            renderComponent(createInjectedVariable({ entryId: '1' }), undefined);

            const input = await screen.findByRole('textbox');
            await user.click(input);

            await waitFor(() => {
                expect(window.StudioUISDK.variable.dataSource.getInjectedItemById).toHaveBeenCalledWith(
                    'ds-var-1',
                    '1',
                );
            });
            expect(window.StudioUISDK.dataConnector.getPageItemById).not.toHaveBeenCalled();
        });

        it('preselects and displays the first injected row after opening the modal', async () => {
            renderComponent(createInjectedVariable(), undefined);

            const input = await screen.findByRole('textbox');
            await user.click(input);

            await waitFor(() => {
                expect(screen.getByText('Data Source')).toBeInTheDocument();
            });

            const closeButton = screen.getByTestId('test-gsc-modal-close-action-button');
            await user.click(closeButton);

            expect(await screen.findByDisplayValue('1 | Joe | 15')).toBeInTheDocument();
        });

        it('navigates to the next injected row when the next button is clicked', async () => {
            renderComponent(createInjectedVariable(), undefined);

            const input = await screen.findByRole('textbox');
            await user.click(input);

            await waitFor(() => {
                expect(screen.getByText('Data Source')).toBeInTheDocument();
            });

            const closeButton = screen.getByTestId('test-gsc-modal-close-action-button');
            await user.click(closeButton);

            await screen.findByDisplayValue('1 | Joe | 15');
            await user.click(screen.getByTestId('test-sui-data-row-next'));

            expect(await screen.findByDisplayValue('2 | John | 18')).toBeInTheDocument();
            expect(window.StudioUISDK.variable.dataSource.setValue).toHaveBeenCalledWith('ds-var-1', '2');
        });

        it('reloads injected data and preselects the first row when onInjectedDataChanged fires', async () => {
            renderComponent(createInjectedVariable(), undefined);

            await waitFor(() => {
                expect(injectedDataChangedHandler).toBeDefined();
            });

            await act(async () => {
                injectedDataChangedHandler!('ds-var-1');
            });

            await waitFor(() => {
                expect(window.StudioUISDK.variable.dataSource.getInjectedData).toHaveBeenCalledWith('ds-var-1');
            });
            expect(await screen.findByDisplayValue('1 | Joe | 15')).toBeInTheDocument();
        });

        it('updates the displayed row when entryId changes after injected data is loaded', async () => {
            const TestHarness = () => {
                const [variable, setVariable] = useState(createInjectedVariable());

                return (
                    <>
                        <DataSourceVariableTableMode variable={variable} validationError={undefined} />
                        <button type="button" onClick={() => setVariable((current) => ({ ...current, entryId: '2' }))}>
                            set-entry-2
                        </button>
                    </>
                );
            };

            const container = document.body.appendChild(APP_WRAPPER.cloneNode(true) as HTMLElement);
            renderWithProviders(
                <div id={APP_WRAPPER_ID}>
                    <TestHarness />
                </div>,
                { preloadedState: getPreloadedState(), container },
            );

            const input = await screen.findByRole('textbox');
            await user.click(input);

            await waitFor(() => {
                expect(screen.getByText('Data Source')).toBeInTheDocument();
            });

            const closeButton = screen.getByTestId('test-gsc-modal-close-action-button');
            await user.click(closeButton);
            await screen.findByDisplayValue('1 | Joe | 15');

            await user.click(screen.getByRole('button', { name: 'set-entry-2' }));

            expect(await screen.findByDisplayValue('2 | John | 18')).toBeInTheDocument();
        });

        it('loads injected data when the mobile table mode panel is active', async () => {
            mockUseMobileSize.mockReturnValue(true);
            renderComponent(createInjectedVariable(), undefined, PanelType.DATA_SOURCE_VARIABLE_TABLE_MODE);

            await waitFor(() => {
                expect(window.StudioUISDK.variable.dataSource.getInjectedData).toHaveBeenCalledWith('ds-var-1');
            });
            expect(screen.getByRole('table')).toBeInTheDocument();
        });
    });

    describe('error and loading states', () => {
        it('hides row navigation when in empty state', async () => {
            setupSDKMocks([]);
            renderComponent(createVariable(), undefined);

            await waitFor(() => {
                expect(window.StudioUISDK.dataConnector.getPage).toHaveBeenCalled();
            });
            expect(screen.queryByTestId('test-sui-data-row-info')).not.toBeInTheDocument();
        });

        it('shows row navigation when data is available', async () => {
            renderComponent(createVariable(), undefined);

            await screen.findByDisplayValue('1 | Joe | 15');
            expect(screen.getByTestId('test-sui-data-row-info')).toBeInTheDocument();
        });
    });
});
