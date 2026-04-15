import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    DataSourceVariable,
    DataSourceVariableDisplayOptionsList,
    VariableType,
    VariableVisibilityType,
} from '@chili-publish/studio-sdk';
import { renderWithProviders } from '@tests/mocks/Provider';
import DataSourceVariableListMode from '../../../../components/variablesComponents/dataSourceVariable/DataSourceListMode';
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

const createVariable = (overrides: Partial<DataSourceVariable> = {}): DataSourceVariable =>
    ({
        id: 'ds-var-1',
        name: 'DataSourceVar',
        label: 'My Data Source',
        type: VariableType.dataSource,
        value: { connectorId: 'connector-1' },
        isReadonly: false,
        isRequired: false,
        isVisible: true,
        visibility: { type: VariableVisibilityType.visible },
        parentId: '',
        occurrences: 0,
        privateData: {},
        helpText: '',
        placeholder: '',
        displayOptions: {
            displayColumn: 'name',
        } as DataSourceVariableDisplayOptionsList,
        ...overrides,
    }) as DataSourceVariable;

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

function setupSDKMocks(
    pageData: Record<string, unknown>[] = defaultPageData,
    options: { continuationToken?: string | null; modelKey?: string } = {},
) {
    const { continuationToken = null, modelKey = 'id' } = options;

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

    window.StudioUISDK.variable.dataSource = {
        setValue: jest.fn().mockResolvedValue(undefined),
    } as never;

    window.StudioUISDK.config = {
        events: {
            onConnectorEvent: {
                registerCallback: jest.fn().mockReturnValue(jest.fn()),
            },
        },
    } as never;
}

function renderComponent(
    variable: DataSourceVariable,
    validationError: string | undefined,
    panelType: PanelType = PanelType.DEFAULT,
) {
    return renderWithProviders(<DataSourceVariableListMode variable={variable} validationError={validationError} />, {
        preloadedState: getPreloadedState(panelType),
    });
}

describe('DataSourceVariableListMode', () => {
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
        it('uses variable label for the select label', async () => {
            renderComponent(createVariable(), undefined);

            await waitFor(() => {
                expect(screen.getByText('My Data Source')).toBeInTheDocument();
            });
        });

        it('falls back to variable name when label is not set', async () => {
            renderComponent(createVariable({ label: undefined }), undefined);

            await waitFor(() => {
                expect(screen.getByText('DataSourceVar')).toBeInTheDocument();
            });
        });

        it('uses variable placeholder when set', async () => {
            setupSDKMocks([]);
            renderComponent(createVariable({ placeholder: 'Pick a record' }), undefined);

            await waitFor(() => {
                expect(screen.getByText('Pick a record')).toBeInTheDocument();
            });
        });

        it('returns null when no connector is configured', () => {
            const { container } = renderComponent(createVariable({ value: { connectorId: '' } as never }), undefined);

            expect(container.querySelector('[role="combobox"]')).not.toBeInTheDocument();
        });
    });

    describe('help text', () => {
        it('displays help text when present and no validation error', async () => {
            renderComponent(createVariable({ helpText: 'Pick a row' }), undefined);

            await waitFor(() => {
                expect(screen.getByText('Pick a row')).toBeInTheDocument();
            });
        });

        it('hides help text when validation error is present', async () => {
            renderComponent(createVariable({ helpText: 'Pick a row' }), 'Field is required');

            await waitFor(() => {
                expect(screen.getByRole('combobox')).toBeInTheDocument();
            });
            expect(screen.queryByText('Pick a row')).not.toBeInTheDocument();
        });
    });

    describe('desktop interactions', () => {
        it('calls onVariableFocus when dropdown is opened', async () => {
            renderComponent(createVariable(), undefined);

            const combobox = await screen.findByRole('combobox');
            await user.click(combobox);

            await waitFor(() => {
                expect(mockOnVariableFocus).toHaveBeenCalledWith('ds-var-1');
            });
        });

        it('calls onVariableBlur when dropdown is closed', async () => {
            renderComponent(createVariable(), undefined);

            const combobox = await screen.findByRole('combobox');
            await user.click(combobox);

            await waitFor(() => {
                expect(mockOnVariableFocus).toHaveBeenCalledWith('ds-var-1');
            });

            await user.keyboard('{Escape}');

            await waitFor(() => {
                expect(mockOnVariableBlur).toHaveBeenCalledWith('ds-var-1');
            });
        });

        it('renders options matching displayColumn values', async () => {
            renderComponent(createVariable(), undefined);

            const combobox = await screen.findByRole('combobox');
            await user.click(combobox);

            await waitFor(() => {
                expect(screen.getByText('Joe')).toBeInTheDocument();
                expect(screen.getByText('John')).toBeInTheDocument();
            });
        });

        it('selects a row when option is clicked', async () => {
            renderComponent(createVariable(), undefined);

            const combobox = await screen.findByRole('combobox');
            await user.click(combobox);

            await waitFor(() => {
                expect(screen.getByText('John')).toBeInTheDocument();
            });

            await user.click(screen.getByText('John'));

            await waitFor(() => {
                expect(window.StudioUISDK.variable.dataSource.setValue).toHaveBeenCalledWith('ds-var-1', '2');
            });
        });
    });

    describe('data loading', () => {
        it('calls getPage to load initial data', async () => {
            renderComponent(createVariable(), undefined);

            await waitFor(() => {
                expect(window.StudioUISDK.dataConnector.getPage).toHaveBeenCalledWith(
                    'connector-1',
                    expect.objectContaining({ continuationToken: null }),
                );
            });
        });

        it('calls getModel to fetch the key property name', async () => {
            renderComponent(createVariable(), undefined);

            await waitFor(() => {
                expect(window.StudioUISDK.dataConnector.getModel).toHaveBeenCalledWith('connector-1');
            });
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

        it('filters out rows where displayColumn is empty', async () => {
            setupSDKMocks([
                { id: '1', name: 'Joe', age: 15 },
                { id: '2', name: null, age: 18 },
            ]);
            renderComponent(createVariable(), undefined);

            const combobox = await screen.findByRole('combobox');
            await user.click(combobox);

            await waitFor(() => {
                expect(screen.getByText('Joe')).toBeInTheDocument();
            });
            expect(screen.queryByText('John')).not.toBeInTheDocument();
        });
    });

    describe('mobile behavior', () => {
        beforeEach(() => {
            mockUseMobileSize.mockReturnValue(true);
        });

        it('renders MobileDataSourceListModeControl when not in list mode panel', async () => {
            renderComponent(createVariable(), undefined);

            await waitFor(() => {
                expect(screen.getByTestId('sui-data-source-variable-list-ds-var-1')).toBeInTheDocument();
            });

            expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        });

        it('dispatches panel action on mobile control click', async () => {
            const { reduxStore } = renderComponent(createVariable(), undefined);

            await waitFor(() => {
                expect(screen.getByTestId('sui-data-source-variable-list-ds-var-1')).toBeInTheDocument();
            });

            await user.click(screen.getByTestId('sui-data-source-variable-list-ds-var-1'));

            await waitFor(() => {
                const state = reduxStore.getState();
                expect(state.panel.activePanel).toBe(PanelType.DATA_SOURCE_VARIABLE_LIST_MODE);
            });
        });

        it('renders MobileDataSourceListModeOptions when list mode panel is active', async () => {
            renderComponent(createVariable(), undefined, PanelType.DATA_SOURCE_VARIABLE_LIST_MODE);

            await waitFor(() => {
                expect(screen.getByText('Joe')).toBeInTheDocument();
                expect(screen.getByText('John')).toBeInTheDocument();
            });
        });

        it('does not render Select when list mode panel is active', async () => {
            renderComponent(createVariable(), undefined, PanelType.DATA_SOURCE_VARIABLE_LIST_MODE);

            await waitFor(() => {
                expect(screen.getByText('Joe')).toBeInTheDocument();
            });

            expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        });

        it('calls onVariableFocus when list mode panel becomes active', async () => {
            renderComponent(createVariable(), undefined, PanelType.DATA_SOURCE_VARIABLE_LIST_MODE);

            await waitFor(() => {
                expect(mockOnVariableFocus).toHaveBeenCalledWith('ds-var-1');
            });
        });

        it('calls onVariableBlur when list mode panel is not active', async () => {
            renderComponent(createVariable(), undefined, PanelType.DEFAULT);

            await waitFor(() => {
                expect(mockOnVariableBlur).toHaveBeenCalledWith('ds-var-1');
            });
        });
    });

    describe('error and loading states', () => {
        it('renders select without options when data is empty', async () => {
            setupSDKMocks([]);
            renderComponent(createVariable(), undefined);

            const combobox = await screen.findByRole('combobox');
            await user.click(combobox);

            await waitFor(() => {
                expect(screen.getByText('No options')).toBeInTheDocument();
            });
        });
    });
});
