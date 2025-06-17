export interface VariableTranslation {
    label?: string;
    placeholder?: string;
    helpText?: string;
}

export interface VariableTranslations {
    [key: string]: VariableTranslation;
}
