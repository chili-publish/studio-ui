import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { VariableTranslations } from 'src/types/VariableTranslations';
import { UITranslations } from 'src/types/UITranslations';
import { LayoutTranslations } from 'src/types/LayoutTranslations';
import type { RootState } from '../index';

type AppConfigState = {
    variableTranslations?: VariableTranslations;
    uiTranslations?: UITranslations;
    layoutTranslations?: LayoutTranslations;
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
export const selectLayoutTranslations = (state: RootState): AppConfigState['layoutTranslations'] =>
    state.appConfig.layoutTranslations;

export default appConfigSlice.reducer;
