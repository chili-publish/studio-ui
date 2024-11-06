import { screen, render } from '@testing-library/react';
import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import DataSource from '../../../components/dataSource/DataSource';

describe('DataSource test', () => {
    it('Should display data connector first row', async () => {
        window.StudioUISDK.dataConnector.getPage = jest.fn().mockResolvedValueOnce({
            parsedData: { data: [{ id: '1', name: 'Joe', age: 15 }] },
        });
        window.StudioUISDK.connector.getAllByType = jest.fn().mockResolvedValueOnce({
            parsedData: [
                {
                    id: '1',
                    name: 'Connector name',
                },
            ],
        });

        render(
            <UiThemeProvider theme="platform">
                <DataSource isDocumentLoaded />
            </UiThemeProvider>,
        );

        expect(await screen.findByDisplayValue('1|Joe|15')).toBeInTheDocument();
    });

    it('Should display data connector first row', async () => {
        window.StudioUISDK.dataConnector.getPage = jest.fn().mockRejectedValueOnce({});
        window.StudioUISDK.connector.getAllByType = jest.fn().mockResolvedValueOnce({
            parsedData: [
                {
                    id: '1',
                    name: 'Connector name',
                },
            ],
        });

        render(
            <UiThemeProvider theme="platform">
                <DataSource isDocumentLoaded />
            </UiThemeProvider>,
        );

        expect(await screen.findByPlaceholderText('Select data row')).toBeInTheDocument();
    });
});
