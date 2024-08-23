import {
    BooleanVariable,
    DateVariable,
    ImageVariable,
    LongTextVariable,
    NumberVariable,
    ShortTextVariable,
    Variable,
    VariableType,
} from '@chili-publish/studio-sdk';
import { ListVariable } from '@chili-publish/studio-sdk/lib/src/next';

export type TextVariable = ShortTextVariable | LongTextVariable;

export const isBooleanVariable = (variable?: Variable): variable is BooleanVariable =>
    variable?.type === VariableType.boolean;
export const isTextVariable = (variable?: Variable): variable is TextVariable =>
    variable?.type === VariableType.shortText || variable?.type === VariableType.longText;
export const isNumberVariable = (variable?: Variable): variable is NumberVariable =>
    variable?.type === VariableType.number;
export const isDateVariable = (variable?: Variable): variable is DateVariable => variable?.type === VariableType.date;
export const isListVariable = (variable?: Variable): variable is ListVariable => variable?.type === VariableType.list;
export const isImageVariable = (variable?: Variable): variable is ImageVariable =>
    variable?.type === VariableType.image;

export const validateVariableValue = (variable: Variable) => {
    if (isTextVariable(variable)) return !!variable.value.trim();
    if (isNumberVariable(variable)) return variable.value !== null && variable.value !== undefined;
    if (isDateVariable(variable)) return !!variable.value;
    if (isListVariable(variable)) return !!variable.selected;
    if (isImageVariable(variable)) return !!variable.value?.assetId || !!variable.value?.resolved;
    if (isBooleanVariable(variable)) return true;

    return true;
};

export const getVariableErrMsg = (variable: Variable) => {
    const isValid = variable.isRequired ? validateVariableValue(variable) : true;

    return !isValid ? 'This field is required' : '';
};
