import { EditorResponse, Variable, VariableType } from '@chili-publish/studio-sdk';

export interface IVariablesComponents {
    type: VariableType;
    variable: Variable;
}

export interface IImageVariable {
    variable: Variable;
    handleImageRemove: () => Promise<EditorResponse<null> | null>;
}

export interface ITextVariable {
    handleValueChange: (value: string) => Promise<void>;
    variable: Variable;
}
