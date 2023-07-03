import { EditorResponse, Variable, VariableType } from '@chili-publish/studio-sdk';

export interface IVariablesComponents {
    type: VariableType;
    variable: Variable;
    isDocumentLoaded: boolean;
}

export interface IImageVariable {
    variable: Variable;
    handleImageRemove: () => Promise<EditorResponse<null> | null>;
}

export interface ITextVariable {
    handleValueChange: (value: string | boolean) => Promise<EditorResponse<null> | null> | null;
    variable: Variable;
}

export interface IBooleanVariable {
    handleValueChange: (value: boolean | boolean) => Promise<EditorResponse<null> | null> | null;
    variable: Variable;
}
