import { ConnectorType } from '@chili-publish/studio-sdk';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import axios from 'axios';
import { MediaRemoteConnector } from '../../utils/ApiTypes';
import { getConnectorUrl } from '../../utils/connectors';
import type { RootState } from '../index';

type MediaConnectors = { [connectorId: string]: MediaRemoteConnector };

type MediaState = {
    connectors: MediaConnectors;
};
const initialState: MediaState = {
    connectors: {},
};

export const getEnvironmentConnectorsFromDocument = createAsyncThunk(
    'media/getEnvironmentConnectorsFromDocument',
    async ({ authToken }: { authToken: string }, { getState }) => {
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

        const remoteConnectors = await Promise.allSettled(
            Object.keys(connectorGroups).map((url) =>
                axios
                    .get<MediaRemoteConnector>(url, { headers: { Authorization: `Bearer ${authToken}` } })
                    .then((res) => ({
                        url,
                        data: res.data,
                    })),
            ),
        );

        return remoteConnectors.reduce((state, result) => {
            if (result.status === 'fulfilled') {
                const { url, data } = result.value;
                connectorGroups[url].forEach((connectorId) => {
                    state[connectorId] = data;
                });
            }
            return state;
        }, {} as MediaConnectors);
    },
);

export const mediaSlice = createSlice({
    name: 'media',
    initialState,
    reducers: {
        setMediaConnectors: (state, action: PayloadAction<MediaConnectors>) => {
            state.connectors = action.payload;
        },
    },
});

export const { setMediaConnectors } = mediaSlice.actions;

export const selectMediaConnectors = (state: RootState): MediaState['connectors'] => state.media.connectors;
export default mediaSlice.reducer;
