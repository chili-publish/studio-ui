import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../index';

type DocumentConfiguration = {
    graFxStudioEnvironmentApiBaseUrl: string;
};

type DocumentState = {
    configuration?: DocumentConfiguration;
    documentRefreshCount: number;
};
const initialState: DocumentState = { documentRefreshCount: 0 };

export const documentSlice = createSlice({
    name: 'document',
    initialState,
    reducers: {
        setConfiguration: (state, action: PayloadAction<DocumentConfiguration>) => {
            state.configuration = action.payload;
        },
        incrementDocumentRefreshCount: (state) => {
            state.documentRefreshCount += 1;
        },
    },
});

export const { setConfiguration, incrementDocumentRefreshCount } = documentSlice.actions;

export const selectDocumentRefreshCount = (state: RootState): number => state.document.documentRefreshCount;

export default documentSlice.reducer;
