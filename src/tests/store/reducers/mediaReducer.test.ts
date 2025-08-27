/* eslint-disable @typescript-eslint/no-explicit-any */
import EditorSDK, { ConnectorRegistrationSource } from '@chili-publish/studio-sdk';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import { mock } from 'jest-mock-extended';
import document from 'src/store/reducers/documentReducer';
import media, { getEnvironmentConnectorsFromDocument } from 'src/store/reducers/mediaReducer';

jest.mock('axios');

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

        (axios.get as jest.Mock).mockImplementation(async (url: string) => {
            const id = url.split('/').at(-1);
            if (id === '404') {
                throw new Error('Not found');
            }
            return {
                data: {
                    id,
                },
            };
        });

        const mockGetConnectorById = jest.fn().mockImplementation(async (connectorId: string) => {
            if (connectorId === 'broken') {
                throw new Error('Not found');
            }
            return { id: connectorId };
        });

        const result = await store
            .dispatch(
                getEnvironmentConnectorsFromDocument({
                    authToken: 'Token',
                    getConnectorById: mockGetConnectorById,
                }),
            )
            .unwrap();

        // The broken connector should fail with environment client API and fall back to fetch
        // The other connectors should succeed with environment client API
        expect(result).toEqual({
            '1-url': { id: '1-url' },
            '2-grafx': { id: '2-grafx' },
            '3-url': { id: '3-url' },
        });

        expect(mockGetConnectorById).toHaveBeenCalledTimes(4);
        expect(mockGetConnectorById).toHaveBeenCalledWith('broken');
        expect(mockGetConnectorById).toHaveBeenCalledWith('1-url');
        expect(mockGetConnectorById).toHaveBeenCalledWith('2-grafx');
        expect(mockGetConnectorById).toHaveBeenCalledWith('3-url');
    });
});
