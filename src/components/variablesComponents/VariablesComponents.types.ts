import {
    DateVariable,
    EditorResponse,
    ImageVariable,
    NumberVariable,
    Variable,
    VariableType,
    DataSourceVariable as DataSourceVariableType,
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
    handleImageChange: (payload: {
        assetId: string;
        id: string;
        context: { searchInUploadFolder: boolean };
    }) => Promise<void>;
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
    onValidateValue: (value: number) => void;
    onCommitValue: (value: number) => Promise<EditorResponse<null> | null>;
}
export interface IDateVariable {
    variable: DateVariable;
    validationError?: string;
    /** When set (desktop), ISO 8601 date strings (YYYY-MM-DD) commit via SDK with draft revert on failure. Omit for mobile inline picker. */
    onValidateValue?: (isoDate: string) => void;
    onCommitValue?: (isoDate: string) => Promise<EditorResponse<null> | null>;
    onBlur?: (isoDate: string | null | undefined) => void;
    setDate?: (isoDate: string) => void;
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

export interface IDataSourceVariable {
    variable: DataSourceVariableType;
    validationError?: string;
    onValueChange?: (value: string, { changed }: { changed: boolean }) => Promise<EditorResponse<null> | null> | null;
}
