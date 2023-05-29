export const enum ContentType {
    VARIABLES_LIST = 'variables_list',
    IMAGE_PANEL = 'image_panel',
}

export interface ITrayAndLeftPanelContext {
    showVariablesPanel: () => void;
    showImagePanel: (_: string) => void;
    contentType: ContentType;
    currentVariableId: string;
}
