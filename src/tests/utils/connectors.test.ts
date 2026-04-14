/* eslint-disable @typescript-eslint/no-explicit-any */
import EditorSDK, { ConnectorMappingDirection, VariableType } from '@chili-publish/studio-sdk';
import { mock } from 'jest-mock-extended';
import {
    getConnectorConfigurationOptions,
    getRemoteConnector,
    isAuthenticationRequired,
    normalizeSupportedAuth,
    parseConnectorHubIdFromExternalSourceId,
    verifyAuthentication,
} from '../../utils/connectors';

describe('utils connectors', () => {
    const mockSDK = mock<EditorSDK>();
    mockSDK.next.connector = {} as any;
    mockSDK.next.variable = {} as any;

    mockSDK.next.connector.getById = jest.fn().mockResolvedValue({
        parsedData: {
            source: { url: 'http://deploy.com/media-connector' },
        },
    });
    mockSDK.mediaConnector.query = jest.fn();
    mockSDK.next.variable.getById = jest.fn();
    mockSDK.connector.getMappings = jest.fn();

    window.StudioUISDK = mockSDK;

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('normalizeSupportedAuth', () => {
        it('returns "oAuth2AuthorizationCode" for oAuth2AuthorizationCode (any case)', () => {
            expect(normalizeSupportedAuth('oAuth2AuthorizationCode')).toBe('oAuth2AuthorizationCode');
            expect(normalizeSupportedAuth('oauth2authorizationcode')).toBe('oAuth2AuthorizationCode');
            expect(normalizeSupportedAuth('OAUTH2AUTHORIZATIONCODE')).toBe('oAuth2AuthorizationCode');
        });

        it('returns "none" for none, empty string, and missing value', () => {
            expect(normalizeSupportedAuth('none')).toBe('none');
            expect(normalizeSupportedAuth('NONE')).toBe('none');
            expect(normalizeSupportedAuth('')).toBe('none');
            expect(normalizeSupportedAuth(undefined)).toBe('none');
            expect(normalizeSupportedAuth(null)).toBe('none');
        });

        it('trims and lowercases before matching', () => {
            expect(normalizeSupportedAuth('  none  ')).toBe('none');
            expect(normalizeSupportedAuth('  oAuth2AuthorizationCode  ')).toBe('oAuth2AuthorizationCode');
        });

        it('returns "unknown" for unrecognized values', () => {
            expect(normalizeSupportedAuth('some-other-auth')).toBe('unknown');
            expect(normalizeSupportedAuth('basic')).toBe('unknown');
            expect(normalizeSupportedAuth('custom')).toBe('unknown');
        });
    });

    describe('parseConnectorHubIdFromExternalSourceId', () => {
        it('returns undefined for null, undefined, and empty string', () => {
            expect(parseConnectorHubIdFromExternalSourceId(null)).toBeUndefined();
            expect(parseConnectorHubIdFromExternalSourceId(undefined)).toBeUndefined();
            expect(parseConnectorHubIdFromExternalSourceId('')).toBeUndefined();
        });

        it('returns the part before the last underscore as hub id', () => {
            expect(parseConnectorHubIdFromExternalSourceId('hub_1.0.0')).toBe('hub');
        });
    });

    it('should handle "getRemoteConnector" correctly', async () => {
        const mockEnvironmentClientApiMethod = jest.fn().mockResolvedValue({
            id: 'remote-connector-1',
        });

        const connector = await getRemoteConnector('connector-1', mockEnvironmentClientApiMethod);

        expect(connector).toEqual({
            id: 'remote-connector-1',
        });

        (window.StudioUISDK.next.connector.getById as jest.Mock).mockResolvedValueOnce({
            parsedData: null,
        });

        expect(async () => {
            await getRemoteConnector('connector-1', mockEnvironmentClientApiMethod);
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

    it('should "getConnectorConfigurationOptions" correctly', async () => {
        (mockSDK.next.variable.getById as jest.Mock)
            .mockResolvedValueOnce({
                parsedData: {
                    value: 'text',
                    type: VariableType.shortText,
                },
            })
            .mockResolvedValueOnce({
                parsedData: {
                    value: false,
                    type: VariableType.boolean,
                },
            })
            .mockResolvedValueOnce({
                parsedData: {
                    selected: {
                        value: 'list-item-1',
                    },
                    type: VariableType.list,
                },
            })
            .mockResolvedValueOnce({
                parsedData: {
                    type: VariableType.list,
                },
            });

        (mockSDK.connector.getMappings as jest.Mock).mockResolvedValueOnce({
            parsedData: [
                {
                    name: 'option-1',
                    value: 'plain-text',
                },
                {
                    name: 'option-2',
                    value: 'var.var1',
                },
                {
                    name: 'option-3',
                    value: true,
                },
                {
                    name: 'option-4',
                    value: 'var.var2',
                },
                {
                    name: 'option-5',
                    value: 'var.var3',
                },
                {
                    name: 'option-6',
                    value: 'var.var4',
                },
            ],
        });

        const options = await getConnectorConfigurationOptions('connector-1');

        expect(mockSDK.connector.getMappings).toHaveBeenCalledWith(
            'connector-1',
            ConnectorMappingDirection.engineToConnector,
        );
        expect(options).toEqual({
            'option-1': 'plain-text',
            'option-2': 'text',
            'option-3': true,
            'option-4': false,
            'option-5': 'list-item-1',
            'option-6': null,
        });
    });
});
