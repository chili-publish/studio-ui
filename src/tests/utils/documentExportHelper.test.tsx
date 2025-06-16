import { DownloadFormats } from '@chili-publish/studio-sdk';
import axios from 'axios';
import { addTrailingSlash, getDownloadLink } from '../../utils/documentExportHelper';

jest.mock('axios');

describe('"getDownloadLink', () => {
    beforeAll(() => {
        Object.defineProperty(window, 'location', {
            writable: true,
            value: {
                hostname: 'chiligrafx.com',
            },
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('handle errors correctly', () => {
        beforeEach(() => {
            window.StudioUISDK.document.getCurrentState = jest.fn().mockResolvedValue({ data: '{}' });
        });
        it('should return "Unexpected error"', async () => {
            const res = await getDownloadLink(
                DownloadFormats.PDF,
                '',
                () => 'Token',
                '1',
                'projectId',
                undefined,
                false,
            );
            expect(res).toEqual({
                status: 500,
                error: 'Unexpected error during polling',
                success: false,
                parsedData: undefined,
                data: undefined,
            });
        });

        it('should return ApiError', async () => {
            (axios.post as jest.Mock).mockResolvedValueOnce({
                data: {
                    status: '503',
                    detail: 'Api Error',
                },
            });
            const res = await getDownloadLink(
                DownloadFormats.PDF,
                '',
                () => 'Token',
                '1',
                'projectId',
                undefined,
                false,
            );
            expect(res).toEqual({
                status: 503,
                error: 'Api Error',
                success: false,
                parsedData: undefined,
                data: undefined,
            });
        });

        it('should return "Error during polling', async () => {
            (axios.post as jest.Mock).mockResolvedValueOnce({
                data: {
                    links: {},
                },
            });
            (axios.get as jest.Mock).mockResolvedValueOnce({
                data: {
                    status: 401,
                },
            });
            const res = await getDownloadLink(
                DownloadFormats.PDF,
                '',
                () => 'Token',
                '1',
                'projectId',
                undefined,
                false,
            );
            expect(res).toEqual({
                status: 500,
                error: 'Error during polling',
                success: false,
                parsedData: undefined,
                data: undefined,
            });
        });
    });

    describe('handle data source configuration correctly', () => {
        beforeEach(() => {
            window.StudioUISDK.document.getCurrentState = jest.fn().mockResolvedValue({ data: '{}' });
            window.StudioUISDK.dataSource.getDataSource = jest.fn().mockResolvedValue({
                parsedData: {
                    source: {
                        id: '123',
                    },
                },
            });
            window.StudioUISDK.connector.getMappings = jest.fn().mockResolvedValue({ parsedData: null });
            (axios.post as jest.Mock).mockResolvedValue({
                data: {
                    status: '503',
                    detail: 'Api Error',
                },
            });
        });
        it('should skip sending data source if output settings id is not specified', async () => {
            await getDownloadLink(DownloadFormats.PDF, '', () => 'Token', '1', 'projectId', undefined, false);

            expect(axios.post).toHaveBeenCalledWith(
                `/output/pdf`,
                {
                    engineVersion: null,
                    dataConnectorConfig: undefined,
                    outputSettingsId: undefined,
                    layoutsToExport: ['1'],
                    documentContent: JSON.parse('{}'),
                    projectId: 'projectId',
                },
                { headers: { Authorization: 'Bearer Token', 'Content-Type': 'application/json' } },
            );
        });

        it('should skip sending data source if it is not defined', async () => {
            window.StudioUISDK.dataSource.getDataSource = jest.fn().mockResolvedValue({
                parsedData: null,
            });
            await getDownloadLink(DownloadFormats.PDF, '', () => 'Token', '1', 'projectId', 'outputId', false);

            expect(axios.post).toHaveBeenCalledWith(
                `/output/pdf`,
                {
                    engineVersion: null,
                    dataConnectorConfig: undefined,
                    outputSettingsId: 'outputId',
                    layoutsToExport: ['1'],
                    documentContent: JSON.parse('{}'),
                    projectId: 'projectId',
                },
                { headers: { Authorization: 'Bearer Token', 'Content-Type': 'application/json' } },
            );
        });

        it('should skip sending data source if output setting does not have "dataSourceEnabled"', async () => {
            (axios.get as jest.Mock).mockResolvedValue({
                data: {
                    dataSourceEnabled: false,
                },
            });
            await getDownloadLink(DownloadFormats.PDF, '', () => 'Token', '1', 'projectId', 'outputId', false);

            expect(axios.get).toHaveBeenCalledWith(`/output/settings/outputId`, {
                headers: { Authorization: 'Bearer Token', 'Content-Type': 'application/json' },
            });

            expect(axios.post).toHaveBeenCalledWith(
                `/output/pdf`,
                {
                    engineVersion: null,
                    dataConnectorConfig: undefined,
                    outputSettingsId: 'outputId',
                    layoutsToExport: ['1'],
                    documentContent: JSON.parse('{}'),
                    projectId: 'projectId',
                },
                { headers: { Authorization: 'Bearer Token', 'Content-Type': 'application/json' } },
            );
        });

        it('should send data source', async () => {
            (axios.get as jest.Mock).mockResolvedValue({
                data: {
                    dataSourceEnabled: true,
                },
            });
            await getDownloadLink(DownloadFormats.PDF, '', () => 'Token', '1', 'projectId', 'outputId', false);

            expect(axios.get).toHaveBeenCalledWith(`/output/settings/outputId`, {
                headers: { Authorization: 'Bearer Token', 'Content-Type': 'application/json' },
            });

            expect(axios.post).toHaveBeenCalledWith(
                `/output/pdf`,
                {
                    engineVersion: null,
                    dataConnectorConfig: {
                        dataConnectorId: '123',
                        dataConnectorParameters: {
                            context: null,
                        },
                    },
                    outputSettingsId: 'outputId',
                    layoutsToExport: ['1'],
                    documentContent: JSON.parse('{}'),
                    projectId: 'projectId',
                },
                { headers: { Authorization: 'Bearer Token', 'Content-Type': 'application/json' } },
            );
        });
    });

    describe('success path', () => {
        beforeEach(() => {
            window.StudioUISDK.document.getCurrentState = jest.fn().mockResolvedValue({ data: '{}' });
            (axios.post as jest.Mock).mockResolvedValueOnce({
                data: {
                    links: {},
                },
            });
        });
        it('should return 200 status if all passed', async () => {
            (axios.get as jest.Mock).mockResolvedValueOnce({
                status: 200,
                data: {
                    links: {
                        download: 'http://download.com',
                    },
                },
            });
            const res = await getDownloadLink(
                DownloadFormats.PDF,
                '',
                () => 'Token',
                '1',
                'projectId',
                undefined,
                false,
            );
            expect(res).toEqual({
                status: 200,
                error: undefined,
                success: true,
                parsedData: 'http://download.com',
                data: 'http://download.com',
            });
        });
    });
});

describe('addTrailingSlash', () => {
    it('should add trailing slash if it is missing', () => {
        expect(addTrailingSlash('http://chili.com')).toEqual('http://chili.com/');
    });

    it('should not add trailing slash if it is already there', () => {
        expect(addTrailingSlash('http://chili.com/')).toEqual('http://chili.com/');
    });
});
