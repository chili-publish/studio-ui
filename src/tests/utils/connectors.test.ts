/* eslint-disable @typescript-eslint/no-explicit-any */
import EditorSDK from '@chili-publish/studio-sdk';
import { mock } from 'jest-mock-extended';
import axios from 'axios';
import { isAuthenticationRequired, verifyAuthentication, getRemoteMediaConnector } from '../../utils/connectors';

jest.mock('axios');

describe('utils connectors', () => {
    const mockSDK = mock<EditorSDK>();

    mockSDK.connector.getById = jest.fn().mockResolvedValue({
        parsedData: {
            source: { url: 'http://deploy.com/media-connector' },
        },
    });
    mockSDK.mediaConnector.query = jest.fn();

    window.SDK = mockSDK;

    (axios.get as jest.Mock).mockResolvedValue({
        data: {
            id: 'remote-connector-1',
        },
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle "getRemoteMediaConnector" correctly', async () => {
        const connector = await getRemoteMediaConnector('connector-1');

        expect(connector).toEqual({
            id: 'remote-connector-1',
        });

        (window.SDK.connector.getById as jest.Mock).mockResolvedValueOnce({
            parsedData: null,
        });

        expect(async () => {
            await getRemoteMediaConnector('connector-1');
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
