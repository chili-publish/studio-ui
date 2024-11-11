import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MobileVariablesPanel from '../../../components/variables/MobileVariablesTray';
import { getDataTestIdForSUI } from '../../../utils/dataIds';
import { APP_WRAPPER_ID } from '../../../utils/constants';
import FeatureFlagProvider from '../../../contexts/FeatureFlagProvider';
import { VariablePanelContextProvider } from '../../../contexts/VariablePanelContext';

const dataRows = [
    { id: '1', name: 'Joe', age: 15 },
    { id: '2', name: 'John', age: 18 },
    { id: '3', name: 'Mary', age: 17 },
];

describe('MobileDataSource test', () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    beforeEach(() => {
        jest.useFakeTimers();

        window.IntersectionObserver = jest.fn(
            () =>
                ({
                    observe: jest.fn(),
                    unobserve: jest.fn(),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any),
        );

        window.StudioUISDK.dataConnector.getPage = jest.fn().mockResolvedValueOnce({
            parsedData: { data: dataRows },
        });
        window.StudioUISDK.connector.getAllByType = jest.fn().mockResolvedValueOnce({
            parsedData: [
                {
                    id: '1',
                    name: 'Connector name',
                },
            ],
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });
    it('Should display data connector first row', async () => {
        render(
            <div id={APP_WRAPPER_ID}>
                <UiThemeProvider theme="platform">
                    <FeatureFlagProvider featureFlags={{ STUDIO_DATA_SOURCE: true }}>
                        <MobileVariablesPanel variables={[]} isDocumentLoaded />
                    </FeatureFlagProvider>
                </UiThemeProvider>
            </div>,
        );

        const openBtn = screen.getByTestId(getDataTestIdForSUI('mobile-variables'));
        await act(async () => {
            await user.click(openBtn);
        });

        await waitFor(() => {
            expect(screen.getByDisplayValue('1|Joe|15')).toBeInTheDocument();
            expect(screen.getByText('Row 1')).toBeInTheDocument();
        });
    });

    it('Should open tray with data table on click on data source row', async () => {
        render(
            <div id={APP_WRAPPER_ID}>
                <UiThemeProvider theme="platform">
                    <VariablePanelContextProvider
                        connectors={{ mediaConnectors: [], fontsConnectors: [] }}
                        variables={[]}
                    >
                        <FeatureFlagProvider featureFlags={{ STUDIO_DATA_SOURCE: true }}>
                            <MobileVariablesPanel variables={[]} isDocumentLoaded />
                        </FeatureFlagProvider>
                    </VariablePanelContextProvider>
                </UiThemeProvider>
            </div>,
        );

        const openBtn = screen.getByTestId(getDataTestIdForSUI('mobile-variables'));
        act(() => {
            fireEvent.click(openBtn);
        });
        act(() => {
            jest.advanceTimersByTime(1000);
        });
        act(() => {
            fireEvent.click(openBtn);
        });

        await waitFor(() => {
            const dataSourceRow = screen.getByDisplayValue('1|Joe|15');
            expect(dataSourceRow).toBeInTheDocument();
        });

        await act(async () => {
            await user.click(screen.getByDisplayValue('1|Joe|15'));
        });

        await waitFor(() => {
            const dataRowsTable = screen.getByRole('table');
            expect(dataRowsTable).toBeInTheDocument();

            const allRows = within(dataRowsTable).getAllByRole('row');
            const [header, ...tableRows] = allRows;
            expect(within(header).getByText('id')).toBeInTheDocument();
            expect(within(header).getByText('name')).toBeInTheDocument();
            expect(within(header).getByText('age')).toBeInTheDocument();

            expect(tableRows.length).toBe(dataRows.length);

            tableRows.forEach((tableRow, index) => {
                const cells = within(tableRow).getAllByRole('cell');
                expect(within(cells[0]).getByText(index + 1)).toBeInTheDocument();
                expect(within(cells[1]).getByText(dataRows[index].id)).toBeInTheDocument();
                expect(within(cells[2]).getByText(dataRows[index].name)).toBeInTheDocument();
                expect(within(cells[3]).getByText(dataRows[index].age)).toBeInTheDocument();
            });
        });
        const row = screen.getAllByRole('row')[3];
        await act(async () => {
            await user.click(row);
        });
        await waitFor(() => {
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
            expect(screen.getByText('Data row')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByDisplayValue('3|Mary|17')).toBeInTheDocument();
        });
    });
});
