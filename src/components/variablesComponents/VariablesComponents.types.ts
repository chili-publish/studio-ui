import {
    DateVariable,
    EditorResponse,
    ImageVariable,
    NumberVariable,
    Variable,
    VariableType,
} from '@chili-publish/studio-sdk';
import { ListVariable } from '@chili-publish/studio-sdk/lib/src/next';

export interface IVariablesComponents {
    type: VariableType;
    variable: Variable;
    onCalendarOpen?: (_: DateVariable) => void;
}

export interface IImageVariable {
    variable: ImageVariable;
    validationError?: string;
    handleImageRemove: () => void;
    handleImageChange?: (payload: { assetId: string; id: string }) => void;
}

export interface ITextVariable {
    variable: Variable;
    validationError?: string;
    onValueChange: (value: string, { changed }: { changed: boolean }) => Promise<EditorResponse<null> | null> | null;
}

export interface IBooleanVariable {
    handleValueChange: (value: boolean) => Promise<EditorResponse<null> | null> | null;
    variable: Variable;
}

export interface INumberVariable {
    variable: NumberVariable;
    validationError?: string;
    onValueChange: (value: number, { changed }: { changed: boolean }) => Promise<EditorResponse<null> | null> | null;
}
export interface IDateVariable {
    variable: DateVariable;
    validationError?: string;
    onValueChange?: (value: string, { changed }: { changed: boolean }) => Promise<EditorResponse<null> | null> | null;
    onBlur?: (value: string | null | undefined) => void;
    setDate?: (value: string) => void;
    onCalendarOpen?: (_: DateVariable) => void;
    inline?: boolean;
    selected?: Date | null;

    isOpenOnMobile?: boolean;
}

export interface IListVariable {
    variable: ListVariable;
    validationError?: string;
    onChange: (_: ListVariable) => void;
}
