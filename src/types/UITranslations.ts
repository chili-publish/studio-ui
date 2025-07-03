export interface VariablesTranslations {
    header?: string;
    helpText?: string;
}

export interface DataSourceTranslations {
    header?: string;
    helpText?: string;
    row?: string;
    inputLabel?: string;
}

export interface LayoutsTranslations {
    header?: string;
    helpText?: string;
    inputLabel?: string;
    width?: string;
    height?: string;
}

export interface ToolBarTranslations {
    downloadButton?: {
        label?: string;
        outputSelector?: {
            label?: string;
        };
    };
}

export interface UITranslations {
    formBuilder?: {
        variables?: VariablesTranslations;
        datasource?: DataSourceTranslations;
        layouts?: LayoutsTranslations;
    };
    toolBar?: ToolBarTranslations;
}
