import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type DocumentConfiguration = {
    graFxStudioEnvironmentApiBaseUrl: string;
};

type DocumentState = {
    configuration?: DocumentConfiguration;
};
const initialState: DocumentState = {};

export const documentSlice = createSlice({
    name: 'document',
    initialState,
    reducers: {
        setConfiguration: (state, action: PayloadAction<DocumentConfiguration>) => {
            state.configuration = action.payload;
        },
    },
});

export const { setConfiguration } = documentSlice.actions;

export default documentSlice.reducer;
