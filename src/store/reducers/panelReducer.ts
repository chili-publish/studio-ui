import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { PanelType } from 'src/contexts/VariablePanelContext.types';
import type { RootState } from '../index';

type PanelState = {
    activePanel: PanelType;
    currentVariableId: string;
    currentVariableConnectorId: string;
};

const initialState: PanelState = {
    activePanel: PanelType.DEFAULT,
    currentVariableId: '',
    currentVariableConnectorId: '',
};

export const panelSlice = createSlice({
    name: 'panel',
    initialState,
    reducers: {
        showVariablesPanel: (state) => {
            state.activePanel = PanelType.DEFAULT;
        },
        showDatePickerPanel: (state, action: PayloadAction<{ variableId: string }>) => {
            state.activePanel = PanelType.DATE_VARIABLE_PICKER;
            state.currentVariableId = action.payload.variableId;
        },
        showDataSourcePanel: (state) => {
            state.activePanel = PanelType.DATA_SOURCE_TABLE;
        },
        showImagePanel: (state, action: PayloadAction<{ variableId: string; connectorId: string }>) => {
            state.currentVariableId = action.payload.variableId;
            state.currentVariableConnectorId = action.payload.connectorId;
            state.activePanel = PanelType.IMAGE_PANEL;
        },
    },
});

export const { showVariablesPanel, showDatePickerPanel, showDataSourcePanel, showImagePanel } = panelSlice.actions;

export const selectActivePanel = (state: RootState): PanelState['activePanel'] => state.panel.activePanel;
export const selectCurrentVariableId = (state: RootState): PanelState['currentVariableId'] =>
    state.panel.currentVariableId;
export const selectCurrentVariableConnectorId = (state: RootState): PanelState['currentVariableConnectorId'] =>
    state.panel.currentVariableConnectorId;

export default panelSlice.reducer;
