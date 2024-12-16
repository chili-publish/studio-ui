import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { APP_WRAPPER } from '@tests/shared.util/app';
import DataSource from '../../../components/dataSource/DataSource';
import { APP_WRAPPER_ID } from '../../../utils/constants';

const tableData = [
    { id: '1', name: 'Joe', age: 15 },
    { id: '2', name: 'John', age: 18 },
    { id: '3', name: 'Mary', age: 17 },
];

describe('DataSourceModal test', () => {
    const user = userEvent.setup();

    beforeAll(() => {
        window.IntersectionObserver = jest.fn(
            () =>
                ({
                    observe: jest.fn(),
                    unobserve: jest.fn(),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any),
        );
    });

    beforeEach(() => {
        window.StudioUISDK.dataConnector.getPage = jest.fn().mockResolvedValueOnce({
            parsedData: { data: tableData },
        });
        window.StudioUISDK.connector.getAllByType = jest.fn().mockResolvedValueOnce({
            parsedData: [
                {
                    id: '1',
                    name: 'Connector name',
                },
            ],
        });
        window.StudioUISDK.dataSource.setDataRow = jest.fn();
    });

    it('Should open modal with data rows on click on data source row', async () => {
        render(
            <UiThemeProvider theme="platform">
                <div id={APP_WRAPPER_ID}>
                    <DataSource isDocumentLoaded />
                </div>
            </UiThemeProvider>,
            { container: document.body.appendChild(APP_WRAPPER) },
        );

        const dataSourceRow = await screen.findByDisplayValue('1 | Joe | 15');
        expect(dataSourceRow).toBeInTheDocument();

        await act(async () => {
            await user.click(dataSourceRow);
        });

        await waitFor(() => {
            const dataRowsTable = screen.getByRole('table');
            expect(dataRowsTable).toBeInTheDocument();

            const allRows = within(dataRowsTable).getAllByRole('row');
            const [header, ...tableRows] = allRows;
            expect(within(header).getByText('id')).toBeInTheDocument();
            expect(within(header).getByText('name')).toBeInTheDocument();
            expect(within(header).getByText('age')).toBeInTheDocument();

            expect(tableRows.length).toBe(tableData.length);

            tableRows.forEach((tableRow, index) => {
                const cells = within(tableRow).getAllByRole('cell');
                expect(within(cells[0]).getByText(index + 1)).toBeInTheDocument();
                expect(within(cells[1]).getByText(tableData[index].id)).toBeInTheDocument();
                expect(within(cells[2]).getByText(tableData[index].name)).toBeInTheDocument();
                expect(within(cells[3]).getByText(tableData[index].age)).toBeInTheDocument();
            });
        });

        expect(screen.getByDisplayValue('1 | Joe | 15')).toBeInTheDocument();
        await act(async () => {
            await user.click(screen.getByText('Mary'));
        });
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
        expect(screen.getByDisplayValue('3 | Mary | 17')).toBeInTheDocument();
    });

    it('Should be able to navigate with arrow key in the data source table', async () => {
        render(
            <UiThemeProvider theme="platform">
                <div id={APP_WRAPPER_ID}>
                    <DataSource isDocumentLoaded />
                </div>
            </UiThemeProvider>,
            { container: document.body.appendChild(APP_WRAPPER) },
        );
        const dataSourceRow = await screen.findByDisplayValue('1 | Joe | 15');
        expect(dataSourceRow).toBeInTheDocument();

        await act(async () => {
            await user.click(dataSourceRow);
        });

        await waitFor(() => {
            const dataRowsTable = screen.getByRole('table');
            expect(dataRowsTable).toBeInTheDocument();
        });

        expect(screen.getByText('Row 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1 | Joe | 15')).toBeInTheDocument();

        await act(async () => {
            await user.keyboard('[ArrowDown]');
        });
        await act(async () => {
            await user.keyboard('[Enter]');
        });

        expect(screen.queryByRole('table')).not.toBeInTheDocument();
        expect(screen.getByText('Row 2')).toBeInTheDocument();
        expect(screen.getByDisplayValue('2 | John | 18')).toBeInTheDocument();
    });
});
