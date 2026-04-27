import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '..';
import { DataItem } from '@chili-publish/studio-sdk';

type DataSourceVariableState = {
    dataSourceVariableData: {
        [key: string]: {
            data: DataItem[];
            continuationToken: string | null;
            previousPageToken: string | null;
            rowKey: string | null;
        };
    };
};

const initialState: DataSourceVariableState = {
    dataSourceVariableData: {},
};

export const dataSourceVariableSlice = createSlice({
    name: 'dataSourceVariable',
    initialState,
    reducers: {
        setDataSourceVariableData: (
            state,
            action: PayloadAction<{
                variableId: string;
                data: DataItem[];
                continuationToken: string | null;
                previousPageToken: string | null;
                rowKey: string | null;
            }>,
        ) => {
            state.dataSourceVariableData[action.payload.variableId] = {
                data: action.payload.data,
                continuationToken: action.payload.continuationToken,
                previousPageToken: action.payload.previousPageToken,
                rowKey: action.payload.rowKey,
            };
        },
    },
});

export const { setDataSourceVariableData } = dataSourceVariableSlice.actions;

export const selectDataSourceVariableData = (
    state: RootState,
): {
    [key: string]: {
        data: DataItem[];
        continuationToken: string | null;
        previousPageToken: string | null;
        rowKey: string | null;
    };
} => state.dataSourceVariable.dataSourceVariableData;

export default dataSourceVariableSlice.reducer;
