/* eslint-disable @typescript-eslint/no-explicit-any */
import EditorSDK from '@chili-publish/studio-sdk';
import axios from 'axios';
import { mock } from 'jest-mock-extended';
import { getRemoteConnector, isAuthenticationRequired, verifyAuthentication } from '../../utils/connectors';

jest.mock('axios');

const GRAFX_ENV_API = 'http://env-1.com/';

describe('utils connectors', () => {
    const mockSDK = mock<EditorSDK>();
    mockSDK.next.connector = {} as any;

    mockSDK.next.connector.getById = jest.fn().mockResolvedValue({
        parsedData: {
            source: { url: 'http://deploy.com/media-connector' },
        },
    });
    mockSDK.mediaConnector.query = jest.fn();

    window.StudioUISDK = mockSDK;

    (axios.get as jest.Mock).mockResolvedValue({
        data: {
            id: 'remote-connector-1',
        },
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle "getRemoteConnector" correctly', async () => {
        const connector = await getRemoteConnector(GRAFX_ENV_API, 'connector-1', 'example');

        expect(connector).toEqual({
            id: 'remote-connector-1',
        });

        (window.StudioUISDK.next.connector.getById as jest.Mock).mockResolvedValueOnce({
            parsedData: null,
        });

        expect(async () => {
            await getRemoteConnector(GRAFX_ENV_API, 'connector-1', 'example');
        }).rejects.toThrow('Connector is not found by connector-1');
    });

    it('should handle "isAuthenticationRequired" correctly', async () => {
        let required = await isAuthenticationRequired({
            id: 'media-connector',
            supportedAuthentication: { browser: ['none'] },
        } as any);

        expect(required).toBeFalsy();

        required = await isAuthenticationRequired({
            id: 'media-connector',
            supportedAuthentication: { browser: ['oAuth2AuthorizationCode'] },
        } as any);

        expect(required).toBeTruthy();
    });

    it('should "verifyAuthentication" correctly', async () => {
        (mockSDK.mediaConnector.query as jest.Mock).mockRejectedValueOnce({ message: 'Some error' });

        await expect(verifyAuthentication('connectorId')).rejects.toEqual(new Error('Unauthorized: Some error'));

        (mockSDK.mediaConnector.query as jest.Mock).mockResolvedValueOnce({ parsedData: {} });

        await expect(verifyAuthentication('connectorId')).resolves.toBeUndefined();

        expect(mockSDK.mediaConnector.query).toHaveBeenCalledWith('connectorId', {});
    });
});
