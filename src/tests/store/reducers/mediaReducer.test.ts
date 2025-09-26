/* eslint-disable @typescript-eslint/no-explicit-any */
import EditorSDK, { ConnectorRegistrationSource } from '@chili-publish/studio-sdk';
import { configureStore } from '@reduxjs/toolkit';
import { mock } from 'jest-mock-extended';
import document from 'src/store/reducers/documentReducer';
import media, { getEnvironmentConnectorsFromDocument } from 'src/store/reducers/mediaReducer';

function getStore() {
    return configureStore({
        reducer: {
            document,
            media,
        },
        preloadedState: {
            document: { configuration: { graFxStudioEnvironmentApiBaseUrl: 'http://env.com' } },
        },
    });
}

describe("'media' reducer", () => {
    let store: ReturnType<typeof getStore>;
    beforeEach(() => {
        const mockSDK = mock<EditorSDK>();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockSDK.next.connector = {} as any;
        mockSDK.next.connector.getAllByType = jest.fn();
        window.StudioUISDK = mockSDK;

        store = getStore();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should correctly group and request connector details', async () => {
        (window.StudioUISDK.next.connector.getAllByType as jest.Mock).mockResolvedValueOnce({
            parsedData: [
                {
                    id: 'grafx-media',
                },
                {
                    id: 'broken',
                    source: {
                        source: ConnectorRegistrationSource.url,
                        url: 'http://env.com/connectors/404',
                    },
                },
                {
                    id: '1-url',
                    source: {
                        source: ConnectorRegistrationSource.url,
                        url: 'http://env.com/connectors/grafx-connector-1',
                    },
                },
                {
                    id: '2-grafx',
                    source: {
                        source: ConnectorRegistrationSource.grafx,
                        id: 'grafx-connector-2',
                    },
                },
                {
                    id: '3-url',
                    source: {
                        source: ConnectorRegistrationSource.url,
                        url: 'http://env.com/connectors/grafx-connector-2',
                    },
                },
            ],
        });

        const mockGetConnectorById = jest.fn().mockImplementation(async (connectorId: string) => {
            if (connectorId === 'grafx-connector-2') {
                return { id: 'grafx-connector-2' };
            }
            throw new Error('Not found');
        });

        // Mock fetch for URL connectors
        global.fetch = jest.fn().mockImplementation(async (url: string) => {
            if (url.includes('grafx-connector-1')) {
                return {
                    ok: true,
                    json: async () => ({ id: 'grafx-connector-1' }),
                } as Response;
            }
            if (url.includes('grafx-connector-2')) {
                return {
                    ok: true,
                    json: async () => ({ id: 'grafx-connector-2' }),
                } as Response;
            }
            throw new Error('Not found');
        });

        const result = await store
            .dispatch(
                getEnvironmentConnectorsFromDocument({
                    getConnectorById: mockGetConnectorById,
                }),
            )
            .unwrap();

        // GraFx connector (2-grafx) uses environment client API with grafx-connector-2
        // URL connectors (1-url, 3-url) use fetch with their URLs
        expect(result).toEqual({
            '1-url': { id: 'grafx-connector-1' },
            '2-grafx': { id: 'grafx-connector-2' },
            '3-url': { id: 'grafx-connector-2' },
        });

        // Environment client API should be called once for the GraFx connector
        expect(mockGetConnectorById).toHaveBeenCalledTimes(1);
        expect(mockGetConnectorById).toHaveBeenCalledWith('grafx-connector-2');
    });
});
