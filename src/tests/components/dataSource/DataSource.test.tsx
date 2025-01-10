import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataSource from '../../../components/dataSource/DataSource';
import { getDataTestIdForSUI } from '../../../utils/dataIds';

jest.mock('../../../utils/connectors', () => ({
    getRemoteMediaConnector: jest.fn().mockResolvedValue({
        supportedAuthentication: {
            browser: [],
        },
    }),
}));

describe('DataSource test', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        window.StudioUISDK.undoManager.addCustomData = jest.fn();
        window.StudioUISDK.dataSource.setDataRow = jest.fn();
        window.StudioUISDK.dataSource.getDataSource = jest.fn().mockResolvedValueOnce({
            parsedData: {
                id: '1',
                name: 'Connector name',
            },
        });
    });

    it('Should display data connector first row', async () => {
        window.StudioUISDK.dataConnector.getPage = jest.fn().mockResolvedValueOnce({
            parsedData: { data: [{ id: '1', name: 'Joe', age: 15 }] },
        });

        render(
            <UiThemeProvider theme="platform">
                <DataSource isDocumentLoaded />
            </UiThemeProvider>,
        );

        expect(await screen.findByDisplayValue('1 | Joe | 15')).toBeInTheDocument();
    });

    it('Data source row should be hidden if data connector is not available', async () => {
        window.StudioUISDK.dataConnector.getPage = jest.fn().mockRejectedValueOnce({});
        window.StudioUISDK.dataSource.getDataSource = jest.fn().mockResolvedValueOnce({
            parsedData: null,
        });

        render(
            <UiThemeProvider theme="platform">
                <DataSource isDocumentLoaded />
            </UiThemeProvider>,
        );

        await waitFor(() => {
            expect(screen.queryByText('Data source')).not.toBeInTheDocument();
        });
    });

    it('Should display data connector placeholder when there is an error during page request', async () => {
        window.StudioUISDK.dataConnector.getPage = jest.fn().mockRejectedValueOnce({});

        render(
            <UiThemeProvider theme="platform">
                <DataSource isDocumentLoaded />
            </UiThemeProvider>,
        );

        expect(await screen.findByPlaceholderText('Select data row')).toBeInTheDocument();
        expect(screen.queryByTestId(getDataTestIdForSUI('data-row-info'))).not.toBeInTheDocument();
    });

    it('Should display data connector placeholder when there is no page available', async () => {
        window.StudioUISDK.dataConnector.getPage = jest.fn().mockResolvedValueOnce({
            parsedData: {
                data: [],
                continuationToken: null,
            },
        });

        render(
            <UiThemeProvider theme="platform">
                <DataSource isDocumentLoaded />
            </UiThemeProvider>,
        );

        expect(await screen.findByPlaceholderText('Select data row')).toBeInTheDocument();
        expect(screen.queryByTestId(getDataTestIdForSUI('data-row-info'))).not.toBeInTheDocument();
    });

    it('Should be able to navigate through available data rows', async () => {
        window.StudioUISDK.dataConnector.getPage = jest.fn().mockResolvedValueOnce({
            parsedData: {
                data: [
                    { id: '1', name: 'Joe', age: 15 },
                    { id: '2', name: 'John', age: 18 },
                    { id: '13', name: 'Mary', age: 17 },
                ],
            },
        });

        render(
            <UiThemeProvider theme="platform">
                <DataSource isDocumentLoaded />
            </UiThemeProvider>,
        );

        expect(await screen.findByPlaceholderText('Select data row')).toBeInTheDocument();
        expect(await screen.findByTestId(getDataTestIdForSUI('data-row-info'))).toBeInTheDocument();

        expect(await screen.findByDisplayValue('1 | Joe | 15')).toBeInTheDocument();
        expect(screen.getByText('Row 1')).toBeInTheDocument();
        expect(window.StudioUISDK.dataSource.setDataRow).toHaveBeenCalledWith({ id: '1', name: 'Joe', age: 15 });

        const prevIcon = screen.getByTestId(getDataTestIdForSUI('data-row-prev'));
        const nextIcon = screen.getByTestId(getDataTestIdForSUI('data-row-next'));

        expect(prevIcon).toBeInTheDocument();
        expect(prevIcon).toHaveAttribute('disabled');
        expect(nextIcon).toBeInTheDocument();
        expect(nextIcon).not.toHaveAttribute('disabled');

        await act(async () => {
            await user.click(nextIcon);
        });
        expect(screen.getByText('Row 2')).toBeInTheDocument();
        expect(await screen.findByDisplayValue('2 | John | 18')).toBeInTheDocument();
        expect(window.StudioUISDK.dataSource.setDataRow).toHaveBeenCalledWith({ id: '2', name: 'John', age: 18 });

        await act(async () => {
            await user.click(nextIcon);
        });

        expect(screen.getByText('Row 3')).toBeInTheDocument();
        expect(await screen.findByDisplayValue('13 | Mary | 17')).toBeInTheDocument();
        expect(nextIcon).toHaveAttribute('disabled');
        expect(window.StudioUISDK.dataSource.setDataRow).toHaveBeenCalledWith({ id: '13', name: 'Mary', age: 17 });

        await act(async () => {
            await user.click(prevIcon);
        });

        expect(screen.getByText('Row 2')).toBeInTheDocument();
        expect(await screen.findByDisplayValue('2 | John | 18')).toBeInTheDocument();
    });

    it('Should load next data rows page when available', async () => {
        window.StudioUISDK.dataConnector.getPage = jest
            .fn()
            .mockResolvedValueOnce({
                parsedData: {
                    data: [
                        { id: '1', name: 'Joe', age: 15 },
                        { id: '2', name: 'John', age: 18 },
                    ],
                    continuationToken: 'token',
                },
            })
            .mockResolvedValueOnce({
                parsedData: {
                    data: [{ id: '3', name: 'Mary', age: 15 }],
                },
            });

        render(
            <UiThemeProvider theme="platform">
                <DataSource isDocumentLoaded />
            </UiThemeProvider>,
        );

        expect(await screen.findByDisplayValue('1 | Joe | 15')).toBeInTheDocument();
        expect(screen.getByText('Row 1')).toBeInTheDocument();

        const nextIcon = screen.getByTestId(getDataTestIdForSUI('data-row-next'));
        await act(async () => {
            await user.click(nextIcon);
        });
        expect(screen.getByText('Row 2')).toBeInTheDocument();
        expect(await screen.findByDisplayValue('2 | John | 18')).toBeInTheDocument();

        await act(async () => {
            await user.click(nextIcon);
        });

        // next page of result is loaded
        expect(await screen.findByDisplayValue('3 | Mary | 15')).toBeInTheDocument();
        expect(screen.getByText('Row 3')).toBeInTheDocument();
    });
});
