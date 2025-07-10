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
    inputPlaceholder?: string;
    width?: string;
    height?: string;
    minWidth?: string;
    minHeight?: string;
    maxWidth?: string;
    maxHeight?: string;
}

export interface ToolBarTranslations {
    downloadButton?: {
        label?: string;
        outputSelector?: {
            label?: string;
        };
    };
    undoBtn?: {
        tooltip?: string;
    };
    redoBtn?: {
        tooltip?: string;
    };
}

export interface LoadDocumentErrorTranslations {
    versionMismatch?: {
        title?: string;
        description?: string;
    };
    projectError?: {
        title?: string;
        description?: string;
    };
    parsingError?: {
        description?: string;
    };
    formatError?: {
        description?: string;
    };
    technicalError?: {
        description?: string;
    };
    btnLabel?: string;
}

export interface ModalsTranslations {
    connectorAuthorization?: {
        title?: string;
        description?: string;
        approveBtnLabel?: string;
        cancelBtnLabel?: string;
    };
    loadDocumentError?: LoadDocumentErrorTranslations;
}

export interface ToastTranslations {
    connectorAuthorization?: {
        error?: string;
        timeoutError?: string;
    };
}

export interface PanelsTranslations {
    media?: {
        title?: string;
        searchPlaceholder?: string;
        noSearchResults?: string;
        rootNavPathLabel?: string;
        folderAssetLabel?: string;
    };
}

export interface UITranslations {
    formBuilder?: {
        variables?: VariablesTranslations;
        datasource?: DataSourceTranslations;
        layouts?: LayoutsTranslations;
    };
    toolBar?: ToolBarTranslations;
    modals?: ModalsTranslations;
    toast?: ToastTranslations;
    panels?: PanelsTranslations;
}
