import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { VariableTranslations } from 'src/types/VariableTranslations';
import type { RootState } from '../index';

type AppConfigState = {
    variableTranslations?: VariableTranslations;
};
const initialState: AppConfigState = {};

export const appConfigSlice = createSlice({
    name: 'appConfig',
    initialState,
    reducers: {
        setVariableTranslations: (state, action: PayloadAction<VariableTranslations>) => {
            state.variableTranslations = action.payload;
        },
    },
});

export const { setVariableTranslations } = appConfigSlice.actions;

export const selectVariableTranslations = (state: RootState): AppConfigState['variableTranslations'] =>
    state.appConfig.variableTranslations;

export default appConfigSlice.reducer;
