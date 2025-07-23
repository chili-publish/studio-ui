import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Variable } from '@chili-publish/studio-sdk';
import type { RootState } from '..';
import { getVariableErrMsg } from '../../components/variablesComponents/Variable';

export interface VariableValidation {
    [variableId: string]: {
        errorMsg: string;
        isTouched?: boolean;
    };
}

type VariableState = {
    currentSelectedVariableId: string;
    currentSelectedVariableConnectorId: string;

    variables: Variable[];
    validation: VariableValidation;
    hasErrors: boolean;
};

const initialState: VariableState = {
    currentSelectedVariableId: '',
    currentSelectedVariableConnectorId: '',
    variables: [],
    validation: {},
    hasErrors: false,
};

export const validateVariableList = createAsyncThunk('variable/validateVariableList', async (_, { getState }) => {
    const { variable } = getState() as RootState;
    let hasErrors = false;

    const validation = variable.variables.reduce((acc, current) => {
        if (!current.isVisible) return acc;
        const errMsg = getVariableErrMsg(current);
        if (errMsg) hasErrors = true;

        return {
            ...acc,
            [current.id]: {
                errorMsg: errMsg,
                isTouched: variable.validation[current.id]?.isTouched,
            },
        };
    }, {});
    return { validation, hasErrors };
});

export const variableSlice = createSlice({
    name: 'variable',
    initialState,
    reducers: {
        setCurrentSelectedVariableId: (state, action: PayloadAction<string>) => {
            state.currentSelectedVariableId = action.payload;
        },
        setCurrentSelectedVariableConnectorId: (state, action: PayloadAction<string>) => {
            state.currentSelectedVariableConnectorId = action.payload;
        },
        setVariables: (state, action: PayloadAction<Variable[]>) => {
            state.variables = action.payload;
        },
        setVariablesValidation: (state, action: PayloadAction<VariableValidation>) => {
            state.validation = action.payload;
        },
        setHasErrors: (state, action: PayloadAction<boolean>) => {
            state.hasErrors = action.payload;
        },
        validateUpdatedVariables: (state) => {
            state.validation = state.variables.reduce((acc, current) => {
                if (!current.isVisible) return acc;
                if (!!state.validation[current.id] && state.validation[current.id].isTouched) {
                    const errMsg = getVariableErrMsg(current);
                    if (errMsg) state.hasErrors = true;

                    const currentConfig = state.validation[current.id];

                    return {
                        ...acc,
                        [current.id]: {
                            ...(currentConfig || {}),
                            errorMsg: errMsg,
                        },
                    };
                }
                return { ...acc, [current.id]: state.validation[current.id] };
            }, {});
        },
        validateVariable: (state, action: PayloadAction<Variable>) => {
            const variable = action.payload;
            const errMsg = getVariableErrMsg(variable);
            if (errMsg) state.hasErrors = true;

            state.validation[variable.id] = {
                errorMsg: getVariableErrMsg(variable),
                isTouched: true,
            };
        },
    },
    extraReducers: (builder) => {
        builder.addCase(validateVariableList.fulfilled, (state, action) => {
            state.validation = action.payload.validation;
            state.hasErrors = action.payload.hasErrors;
        });
    },
});

export const {
    setVariables,
    validateUpdatedVariables,
    validateVariable,
    setCurrentSelectedVariableId,
    setCurrentSelectedVariableConnectorId,
} = variableSlice.actions;

export const selectVariables = (state: RootState): Variable[] => state.variable.variables;
export const selectVariableValidation = (state: RootState, variableId: string): string => {
    return state.variable.validation[variableId].errorMsg ?? '';
};
export const selectHasValidationErrors = (state: RootState): boolean => state.variable.hasErrors;

export const selectVariablesValidation = (state: RootState): VariableValidation => state.variable.validation;
export const selectCurrentVariableId = (state: RootState): string => state.variable.currentSelectedVariableId;
export const selectCurrentVariableConnectorId = (state: RootState): string =>
    state.variable.currentSelectedVariableConnectorId;

export default variableSlice.reducer;
