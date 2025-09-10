import { ConnectorType, MediaConnectorCapabilities } from '@chili-publish/studio-sdk';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { MediaRemoteConnector } from '../../utils/ApiTypes';
import { getConnectorUrl } from '../../utils/connectors';
import type { RootState } from '../index';

type MediaConnectors = { [connectorId: string]: MediaRemoteConnector };
export interface ICapabilities {
    [index: string]: MediaConnectorCapabilities | undefined;
}

type MediaState = {
    connectors: MediaConnectors;
    connectorCapabilities: ICapabilities;
};
const initialState: MediaState = {
    connectors: {},
    connectorCapabilities: {},
};

export const getEnvironmentConnectorsFromDocument = createAsyncThunk(
    'media/getEnvironmentConnectorsFromDocument',
    async (
        {
            getConnectorById,
        }: {
            getConnectorById: (connectorId: string) => Promise<MediaRemoteConnector>;
        },
        { getState },
    ) => {
        const {
            document: { configuration },
        } = getState() as RootState;

        const { parsedData: connectors } = await window.StudioUISDK.next.connector.getAllByType(ConnectorType.media);

        if (!connectors?.length || !configuration?.graFxStudioEnvironmentApiBaseUrl) {
            return {};
        }

        // Group connectors by URL to minimize API calls
        const connectorGroups = connectors
            // Filter out the local connector
            .filter((connector) => connector.id !== 'grafx-media')
            .reduce(
                (groups, connector) => {
                    const url = getConnectorUrl(connector, configuration.graFxStudioEnvironmentApiBaseUrl);
                    if (!groups[url]) {
                        groups[url] = [];
                    }
                    groups[url].push(connector.id);
                    return groups;
                },
                {} as { [url: string]: string[] },
            );

        // Use environment client API to get connectors, grouped by URL
        const remoteConnectors = await Promise.allSettled(
            Object.keys(connectorGroups).map(async (url) => {
                // For GraFx connectors, use environment client API
                const connectorIds = connectorGroups[url];
                const connector = connectors.find((c) => c.id === connectorIds[0]);

                if (connector && connector.source.source === 'grafx') {
                    // Use environment client API for GraFx connectors
                    const grafxConnector = connector.source as { id: string };
                    const data = await getConnectorById(grafxConnector.id);

                    return {
                        url,
                        data,
                    };
                }

                // For URL connectors, use direct fetch
                // for security purpose removed sending of token for none-grafx connectors
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`Failed to fetch connector: ${response.statusText}`);
                }
                const data = await response.json();
                return {
                    url,
                    data,
                };
            }),
        );

        return remoteConnectors.reduce((state, result) => {
            if (result.status === 'fulfilled') {
                const { url, data } = result.value;
                // Apply the data to all connectors that share this URL
                connectorGroups[url].forEach((connectorId) => {
                    state[connectorId] = data;
                });
            }
            return state;
        }, {} as MediaConnectors);
    },
);

export const getCapabilitiesForConnector = createAsyncThunk(
    'media/getCapabilitiesForConnector',
    async ({ connectorId }: { connectorId: string }) => {
        if (!connectorId) throw new Error('ConnectorId is not defined');
        const res = await window.StudioUISDK.mediaConnector.getCapabilities(connectorId);
        if (!res.parsedData) throw new Error('Connector capabilities are not defined');
        return {
            [connectorId]: res.parsedData,
        } as ICapabilities;
    },
);

export const mediaSlice = createSlice({
    name: 'media',
    initialState,
    reducers: {
        setMediaConnectors: (state, action: PayloadAction<MediaConnectors>) => {
            state.connectors = action.payload;
        },
        setConnectorCapabilities: (state, action: PayloadAction<ICapabilities>) => {
            state.connectorCapabilities = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getCapabilitiesForConnector.fulfilled, (state, action) => {
            state.connectorCapabilities = { ...state.connectorCapabilities, ...action.payload };
        });
    },
});

export const { setMediaConnectors, setConnectorCapabilities } = mediaSlice.actions;

export const selectMediaConnectors = (state: RootState): MediaState['connectors'] => state.media.connectors;
export const selectConnectorCapabilities = (state: RootState): MediaState['connectorCapabilities'] =>
    state.media.connectorCapabilities;
export default mediaSlice.reducer;
