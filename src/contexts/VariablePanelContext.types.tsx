import {
    MediaConnectorCapabilities,
    ConnectorInstance,
    ImageVariable,
    Media,
    DateVariable,
    Variable,
} from '@chili-publish/studio-sdk';
import { Dispatch, SetStateAction } from 'react';

export const enum ContentType {
    VARIABLES_LIST = 'variables_list',
    IMAGE_PANEL = 'image_panel',
    DATE_VARIABLE_PICKER = 'date_variable_picker',
}

export interface IConnectors {
    mediaConnectors: ConnectorInstance[];
    fontsConnectors: ConnectorInstance[];
}

export interface ICapabilities {
    [index: string]: MediaConnectorCapabilities | undefined;
}

export interface VariableValidation {
    [variableId: string]: {
        errorMsg: string;
        isTouched?: boolean;
    };
}

export interface VariableValidationOptions {
    validateUpdatedVariables: boolean;
}

export interface IVariablePanelContext {
    showVariablesPanel: () => void;
    showDatePicker: (_: DateVariable) => void;
    showImagePanel: (_: ImageVariable) => void;
    contentType: ContentType;
    currentVariableId: string;
    currentVariableConnectorId: string;
    handleUpdateImage: (_: Media) => void;
    selectedItems: Media[];
    navigationStack: string[];
    setSelectedItems: Dispatch<SetStateAction<Media[]>>;
    setNavigationStack: Dispatch<SetStateAction<string[]>>;
    imagePanelTitle: JSX.Element;
    connectors?: IConnectors;
    connectorCapabilities: ICapabilities;
    getCapabilitiesForConnector: (connectorId: string) => Promise<void>;
    searchKeyWord: string;
    setSearchKeyWord: Dispatch<SetStateAction<string>>;
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;

    variablesValidation: VariableValidation;
    validateVariables: (_?: VariableValidationOptions) => boolean;
    validateUpdatedVariables: () => boolean;
    validateVariable: (_: Variable) => void;
    getVariableError: (_: Variable) => string;
}
