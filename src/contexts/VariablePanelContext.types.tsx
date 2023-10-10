import { ConnectorCapabilities, ConnectorInstance, ImageVariable, Media } from '@chili-publish/studio-sdk';
import { Dispatch, SetStateAction } from 'react';

export const enum ContentType {
    VARIABLES_LIST = 'variables_list',
    IMAGE_PANEL = 'image_panel',
}

export interface IConnectors {
    mediaConnectors: ConnectorInstance[];
    fontsConnectors: ConnectorInstance[];
}

export interface ICapabilities {
    [index: string]: ConnectorCapabilities;
}

export interface IVariablePanelContext {
    showVariablesPanel: () => void;
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
}
