import {
    DateVariable,
    EditorResponse,
    ImageVariable,
    NumberVariable,
    Variable,
    VariableType,
} from '@chili-publish/studio-sdk';

export interface IVariablesComponents {
    type: VariableType;
    variable: Variable;
    isDocumentLoaded: boolean;
    onCalendarOpen?: () => void;
}

export interface IImageVariable {
    variable: ImageVariable;
    handleImageRemove: () => Promise<EditorResponse<null> | null>;
}

export interface ITextVariable {
    handleValueChange: (value: string | boolean) => Promise<EditorResponse<null> | null> | null;
    variable: Variable;
}

export interface IBooleanVariable {
    handleValueChange: (value: boolean) => Promise<EditorResponse<null> | null> | null;
    variable: Variable;
}

export interface INumberVariable {
    variable: NumberVariable;
    handleValueChange: (value: number) => Promise<EditorResponse<null> | null> | null;
}
export interface IDateVariable {
    variable: DateVariable;
    handleValueChange?: (value: string) => Promise<EditorResponse<null> | null> | null;
    setDate?: (value: string) => void;
    onCalendarOpen?: () => void;
    inline?: boolean;
    selected?: Date | null;
}
