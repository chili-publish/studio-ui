import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { VariableTranslations } from 'src/types/VariableTranslations';
import { UITranslations } from 'src/types/UITranslations';
import type { RootState } from '../index';

type AppConfigState = {
    variableTranslations?: VariableTranslations;
    uiTranslations?: UITranslations;
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

export const selectUITranslations = (state: RootState): AppConfigState['uiTranslations'] =>
    state.appConfig.uiTranslations;

export default appConfigSlice.reducer;
