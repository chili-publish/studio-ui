import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '..';

/** Flat row type for Redux; SDK DataItem is assignable but too recursive for Immer drafts. */
export type StoredDataItems = Array<Record<string, unknown>>;

type DataSourceVariableCacheEntry = {
    data: StoredDataItems;
    continuationToken: string | null;
    previousPageToken: string | null;
    rowKey: string | null;
};

type DataSourceVariableState = {
    dataSourceVariableData: Record<string, DataSourceVariableCacheEntry>;
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
                data: StoredDataItems;
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

export const selectDataSourceVariableData = (state: RootState): Record<string, DataSourceVariableCacheEntry> =>
    state.dataSourceVariable.dataSourceVariableData;

export default dataSourceVariableSlice.reducer;
