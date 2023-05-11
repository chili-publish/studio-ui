import { Variable, VariableType } from '@chili-publish/studio-sdk';

export interface IVariablesComponents {
    type: VariableType;
    variable: Variable;
}

export interface IImageVariable {
    variable: Variable;
    handleImageRemove: () => void;
}

export interface ITextVariable {
    handleValueChange: (value: string) => void;
    variable: Variable;
}
