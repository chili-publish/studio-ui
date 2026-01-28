import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { setCurrentSelectedVariableConnectorId, setCurrentSelectedVariableId } from './variableReducer';

export const enum PanelType {
    DEFAULT = 'default',
    IMAGE_PANEL = 'image_panel',
    DATE_VARIABLE_PICKER = 'date_variable_picker',
    DATA_SOURCE_TABLE = 'data_source_table',
    LIST_VARIABLE_PANEL = 'list_variable_panel',
}

type PanelState = {
    activePanel: PanelType;
};

export const showDatePickerPanel = createAsyncThunk(
    'panel/showDatePickerPanel',
    ({ variableId }: { variableId: string }, { dispatch }) => {
        dispatch(setCurrentSelectedVariableId(variableId));
    },
);

export const showImagePanel = createAsyncThunk(
    'panel/showImagePanel',
    ({ variableId, connectorId }: { variableId: string; connectorId: string }, { dispatch }) => {
        dispatch(setCurrentSelectedVariableId(variableId));
        dispatch(setCurrentSelectedVariableConnectorId(connectorId));
    },
);

export const showListVariablePanel = createAsyncThunk(
    'panel/showListVariablePanel',
    ({ variableId }: { variableId: string }, { dispatch }) => {
        dispatch(setCurrentSelectedVariableId(variableId));
    },
);

const initialState: PanelState = {
    activePanel: PanelType.DEFAULT,
};

export const panelSlice = createSlice({
    name: 'panel',
    initialState,
    reducers: {
        showVariablesPanel: (state) => {
            state.activePanel = PanelType.DEFAULT;
        },
        showDataSourcePanel: (state) => {
            state.activePanel = PanelType.DATA_SOURCE_TABLE;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(showDatePickerPanel.fulfilled, (state) => {
            state.activePanel = PanelType.DATE_VARIABLE_PICKER;
        });
        builder.addCase(showImagePanel.fulfilled, (state) => {
            state.activePanel = PanelType.IMAGE_PANEL;
        });
        builder.addCase(showListVariablePanel.fulfilled, (state) => {
            state.activePanel = PanelType.LIST_VARIABLE_PANEL;
        });
    },
});

export const { showVariablesPanel, showDataSourcePanel } = panelSlice.actions;

export const selectActivePanel = (state: RootState): PanelState['activePanel'] => state.panel.activePanel;

export default panelSlice.reducer;
