import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type DocumentConfiguration = {
    graFxStudioEnvironmentApiBaseUrl: string;
};

type DocumentState = {
    configuration?: DocumentConfiguration;
    loadGeneration: number;
};
const initialState: DocumentState = { loadGeneration: 0 };

export const documentSlice = createSlice({
    name: 'document',
    initialState,
    reducers: {
        setConfiguration: (state, action: PayloadAction<DocumentConfiguration>) => {
            state.configuration = action.payload;
        },
        incrementDocumentLoadGeneration: (state) => {
            state.loadGeneration += 1;
        },
    },
});

export const { setConfiguration, incrementDocumentLoadGeneration } = documentSlice.actions;

export default documentSlice.reducer;
