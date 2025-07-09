export interface BaseVariableTranslation {
    label?: string;
    placeholder?: string;
    helpText?: string;
}

export interface ListVariableTranslation extends BaseVariableTranslation {
    listItems?: Record<string, string>;
}

export type VariableTranslation = BaseVariableTranslation | ListVariableTranslation;

export interface VariableTranslations {
    [key: string]: VariableTranslation;
}
