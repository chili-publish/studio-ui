import { ITheme, UiThemeConfig } from '@chili-publish/grafx-shared-components';
import { DownloadFormats } from '@chili-publish/studio-sdk';
import { AxiosError, AxiosResponse } from 'axios';
import { ConnectorAuthenticationResult } from './ConnectorAuthenticationResult';
import { VariableTranslations } from './VariableTranslations';
import { UITranslations } from './UITranslations';
import { LayoutTranslations } from './LayoutTranslations';

export type FeatureFlagsType = Record<string, boolean>;

export enum LoadDocumentError {
    PARSING_ERROR = 'PARSING_ERROR',
    FORMAT_ERROR = 'FORMAT_ERROR',
    VERSION_ERROR = 'VERSION_ERROR',
    TECHNICAL_ERROR = 'TECHNICAL_ERROR',
}

export type ProjectConfig = {
    projectId?: string;
    projectName?: string;
    uiOptions: UiOptions;
    outputSettings: OutputSettings;
    userInterfaceID?: string;
    graFxStudioEnvironmentApiBaseUrl: string;
    sandboxMode?: boolean;
    featureFlags?: FeatureFlagsType;
    onSandboxModeToggle?: () => void;
    onProjectInfoRequested: (projectId?: string) => Promise<Project>;
    onProjectDocumentRequested: (projectId?: string) => Promise<string | null>;
    onProjectLoaded: (project: Project) => void;
    onProjectSave: (generateJson: () => Promise<string>) => Promise<Project>;
    onAuthenticationRequested: () => string;
    onAuthenticationExpired: () => Promise<string>;
    onBack: () => void;
    onLogInfoRequested: () => unknown;
    onProjectGetDownloadLink: (
        extension: string,
        selectedLayoutID: string | undefined,
        outputSettingsId: string | undefined,
    ) => Promise<DownloadLinkResult>;
    editorLink?: string;
    onFetchOutputSettings?: (_?: string) => Promise<UserInterfaceWithOutputSettings | null>;
    onFetchUserInterfaces?: () => Promise<AxiosResponse<PaginatedResponse<UserInterface>, unknown>>;
    onConnectorAuthenticationRequested?: (connectorId: string) => Promise<ConnectorAuthenticationResult>;
    customElement?: HTMLElement | string;
    onSetMultiLayout?: (setMultiLayout: React.Dispatch<React.SetStateAction<boolean>>) => void;
    onVariableFocus?: (variableId: string) => void;
    onVariableBlur?: (variableId: string) => void;
    userInterfaceFormBuilderData?: FormBuilderType;
    onFetchUserInterfaceDetails?: (userInterfaceId?: string) => Promise<UserInterfaceWithOutputSettings | null>;
    onVariableValueChangedCompleted?: (
        variableId: string,
        value: string | boolean | number | null | undefined,
    ) => Promise<void>;
};

export interface DefaultStudioConfig {
    selector: string;
    projectDownloadUrl: string;
    projectUploadUrl: string;
    projectId: string;
    graFxStudioEnvironmentApiBaseUrl: string;
    authToken: string;
    featureFlags?: FeatureFlagsType;
    uiOptions?: UiOptions;

    outputSettings?: OutputSettings;
    projectName: string;
    sandboxMode?: boolean;
    onSandboxModeToggle?: () => void;
    refreshTokenAction?: () => Promise<string | AxiosError>;
    editorLink?: string;
    userInterfaceID?: string;
    onConnectorAuthenticationRequested?: (connectorId: string) => Promise<ConnectorAuthenticationResult>;
    customElement?: HTMLElement | string;
    onSetMultiLayout?: (setMultiLayout: React.Dispatch<React.SetStateAction<boolean>>) => void;
    onVariableFocus?: (variableId: string) => void;
    onVariableBlur?: (variableId: string) => void;
}

export interface StudioConfig extends Omit<DefaultStudioConfig, 'projectId' | 'projectDownloadUrl'> {
    projectId?: string;
    projectDownloadUrl?: string;
    onProjectInfoRequested: () => Promise<Project>;
    onProjectDocumentRequested: () => Promise<string | null>;
    onProjectSave: (generateJson: () => Promise<string>) => Promise<Project>;
}

export type DownloadLinkResult = {
    status: number;
    error: string | undefined;
    success: boolean;
    parsedData: string | undefined;
    data: string | undefined;
};

export interface UiOptions {
    theme?: UiThemeConfig;
    uiTheme?: ITheme['mode'] | 'system';
    uiDirection?: 'ltr' | 'rtl';
    widgets?: {
        downloadButton?: {
            visible?: boolean;
        };
        backButton?: {
            visible?: boolean;
            event?: () => void;
        };
        navBar?: {
            visible?: boolean;
        };
        bottomBar?: {
            visible?: boolean;
        };
    };
    /**
     * Experimental. Don't use in production. Will be changed soon.
     */
    layoutSection?: {
        layoutSwitcherVisible?: boolean;
        title?: string;
    };
    formBuilder?: FormBuilderType;
}

export type OutputSettings = { [K in DownloadFormats]?: boolean };

export type UserInterfaceOutputSettings = {
    name: string;
    id: string;
    description: string;
    type: DownloadFormats;
    dataSourceEnabled: boolean;
    layoutIntents: string[];
};

export type UserInterfaceWithOutputSettings = {
    outputSettings: UserInterfaceOutputSettings[];
    userInterface: {
        id: string;
        name: string;
    };
    formBuilder?: FormBuilderType;
    outputSettingsFullList: IOutputSetting[];
};

export interface BaseFormBuilderType<T extends FormKeys> {
    type: T;
    active: boolean;
    header: string;
    helpText: string;
}

export interface LayoutForm extends BaseFormBuilderType<'layouts'> {
    layoutSelector: boolean;
    multipleLayouts: boolean;
    allowNewProjectFromLayout: boolean;
    showWidthHeightInputs: boolean;
}

export type DataSourceForm = BaseFormBuilderType<'datasource'>;
export type VariablesForm = BaseFormBuilderType<'variables'>;

export type FormBuilderArray = Array<DataSourceForm | VariablesForm | LayoutForm>;
export type DataSourceAndVariablesForm = DataSourceForm | VariablesForm;

export type FormKeys = 'datasource' | 'layouts' | 'variables';

export type FormBuilderType = {
    datasource: DataSourceForm;
    layouts: LayoutForm;
    variables: VariablesForm;
};
export type OutputSettingsType = {
    [index: string]: { layoutIntents: string[] };
};
export type UserInterface = {
    id: string;
    name: string;
    outputSettings: OutputSettingsType;
    formBuilder: FormBuilderArray;
    default: boolean;
};

export type PaginatedResponse<T> = {
    data: T[];
    pageSize: number;
    links?: {
        nextPage: string;
    };
};

export interface IOutputSetting {
    watermarkText: string;
    default: boolean;
    description: string;
    id: string;
    name: string;
    type: DownloadFormats;
    watermark: boolean;
    dataSourceEnabled: boolean;
}

export const defaultUiOptions = {
    widgets: {
        downloadButton: {
            visible: true,
        },
        backButton: {
            visible: false,
        },
    },
    uiTheme: 'light' as ITheme['mode'],
    uiDirection: 'ltr' as const,
};

export const defaultPlatformUiOptions: UiOptions = {
    ...defaultUiOptions,
    widgets: { ...defaultUiOptions.widgets, backButton: { visible: true } },
};

export const defaultOutputSettings: OutputSettings = {
    mp4: true,
    gif: true,
    png: true,
    jpg: true,
    pdf: true,
};

export const defaultFormBuilder: FormBuilderType = {
    datasource: {
        type: 'datasource',
        active: true,
        header: 'Data source',
        helpText: '',
    },
    layouts: {
        type: 'layouts',
        active: true,
        header: 'Layouts',
        helpText: '',
        layoutSelector: true,
        showWidthHeightInputs: true,
        multipleLayouts: true,
        allowNewProjectFromLayout: true,
    },
    variables: {
        type: 'variables',
        active: true,
        header: 'Customize',
        helpText: '',
    },
};

// eslint-disable-next-line no-restricted-globals
export const defaultBackFn = () => history.back();

export type HttpHeaders = { headers: { 'Content-Type': string; Authorization?: string } };

export type Project = { name: string; id: string; template: { id: string } };

export interface IDefaultStudioUILoaderConfig {
    selector: string;

    editorLink?: string;

    projectId: string;
    graFxStudioEnvironmentApiBaseUrl: string;

    authToken: string;
    refreshTokenAction?: () => Promise<string | AxiosError>;
}
export interface IStudioUILoaderConfig {
    selector: string;
    projectId?: string;
    graFxStudioEnvironmentApiBaseUrl: string;
    authToken: string;
    projectName: string;
    refreshTokenAction?: () => Promise<string | AxiosError>;
    uiOptions?: UiOptions;
    userInterfaceID?: string;
    userInterfaceFormBuilderData?: FormBuilderType;
    /**
     * @deprecated The outputSettings property is deprecated and will be removed in a future version.
     */
    outputSettings?: OutputSettings;
    editorLink?: string;
    projectDownloadUrl?: string;
    projectUploadUrl?: string;
    sandboxMode?: boolean;
    featureFlags?: Record<string, boolean>;
    variableTranslations?: VariableTranslations;
    layoutTranslations?: LayoutTranslations;
    onSandboxModeToggle?: () => void;
    onProjectInfoRequested?: (projectId?: string) => Promise<Project>;
    onProjectDocumentRequested?: (projectId?: string) => Promise<string | null>;
    onProjectSave?: (generateJson: () => Promise<string>) => Promise<Project>;
    onProjectLoaded?: (project: Project) => void;
    onAuthenticationRequested?: () => string;
    onAuthenticationExpired?: () => Promise<string>;
    onLogInfoRequested?: () => void;
    onProjectGetDownloadLink?: (
        extension: string,
        selectedLayoutID: string | undefined,
        outputSettingsId: string | undefined,
    ) => Promise<DownloadLinkResult>;
    onConnectorAuthenticationRequested?: (connectorId: string) => Promise<ConnectorAuthenticationResult>;
    customElement?: HTMLElement | string;
    onSetMultiLayout?: (setMultiLayout: React.Dispatch<React.SetStateAction<boolean>>) => void;
    onVariableFocus?: (variableId: string) => void;
    onVariableBlur?: (variableId: string) => void;
    onFetchUserInterfaceDetails?: (userInterfaceId: string) => Promise<UserInterface>;
    onVariableValueChangedCompleted?: (
        variableId: string,
        value: string | boolean | number | null | undefined,
    ) => Promise<void>;
    uiTranslations?: UITranslations;
}

export type PageSnapshot = {
    id: string;
    snapshot: Uint8Array;
};

export type MobileTrayHeaderDetailsr = {
    title: string;
    helpText: string;
};

export type MobileTrayFormBuilderHeader = {
    datasource: MobileTrayHeaderDetailsr;
    variables: MobileTrayHeaderDetailsr;
    layouts: MobileTrayHeaderDetailsr;
};
