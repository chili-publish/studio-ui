import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { PanelType } from 'src/contexts/VariablePanelContext.types';
import type { RootState } from '../index';

type PanelState = {
    currentPanel: PanelType;
    currentVariableId: string;
    currentVariableConnectorId: string;
};

const initialState: PanelState = {
    currentPanel: PanelType.DEFAULT,
    currentVariableId: '',
    currentVariableConnectorId: '',
};

export const panelSlice = createSlice({
    name: 'panel',
    initialState,
    reducers: {
        showVariablesPanel: (state) => {
            state.currentPanel = PanelType.DEFAULT;
        },
        showDatePickerPanel: (state, action: PayloadAction<{ variableId: string }>) => {
            state.currentPanel = PanelType.DATE_VARIABLE_PICKER;
            state.currentVariableId = action.payload.variableId;
        },
        showDataSourcePanel: (state) => {
            state.currentPanel = PanelType.DATA_SOURCE_TABLE;
        },
        showImagePanel: (state, action: PayloadAction<{ variableId: string; connectorId: string }>) => {
            state.currentVariableId = action.payload.variableId;
            state.currentVariableConnectorId = action.payload.connectorId;
            state.currentPanel = PanelType.IMAGE_PANEL;
        },
    },
});

export const { showVariablesPanel, showDatePickerPanel, showDataSourcePanel, showImagePanel } = panelSlice.actions;

export const selectCurrentPanel = (state: RootState): PanelState['currentPanel'] => state.panel.currentPanel;
export const selectCurrentVariableId = (state: RootState): PanelState['currentVariableId'] =>
    state.panel.currentVariableId;
export const selectCurrentVariableConnectorId = (state: RootState): PanelState['currentVariableConnectorId'] =>
    state.panel.currentVariableConnectorId;

export default panelSlice.reducer;
