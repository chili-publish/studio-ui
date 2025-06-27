export interface FormBuilderSectionTranslations {
    header?: string;
    helpText?: string;
    row?: string;
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
        variables?: FormBuilderSectionTranslations;
        datasource?: FormBuilderSectionTranslations;
        layouts?: FormBuilderSectionTranslations;
    };
    toolBar?: ToolBarTranslations;
}
