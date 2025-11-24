import { ITheme, UiThemeConfig } from '@chili-publish/grafx-shared-components';
import { DownloadFormats } from '@chili-publish/studio-sdk';
import {
    UserInterface as EnvironmentUserInterface,
    Project as EnvironmentProject,
    OutputSettings as EnvironmentOutputSettings,
    GenerateGifOutputRequest,
    GenerateJpgOutputRequest,
    GenerateMp4OutputRequest,
    GeneratePdfOutputRequest,
    GeneratePngOutputRequest,
} from '@chili-publish/environment-client-api';
import type { EnvironmentApiService } from '../services/EnvironmentApiService';
import { ConnectorAuthenticationResult } from './ConnectorAuthenticationResult';
import { VariableTranslations } from './VariableTranslations';
import { UITranslations } from './UITranslations';
import { LayoutTranslations } from './LayoutTranslations';

export type FeatureFlagsType = Record<string, boolean>;

// Union type for all possible output generation request types
export type OutputGenerationRequest =
    | GenerateGifOutputRequest
    | GenerateJpgOutputRequest
    | GenerateMp4OutputRequest
    | GeneratePdfOutputRequest
    | GeneratePngOutputRequest;

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
    onEngineInitialized: (project: Project) => void;
    onProjectLoaded?: () => void;
    onProjectSave: (generateJson: () => Promise<string>) => Promise<Project>;
    onBack: () => void;
    onLogInfoRequested: () => unknown;
    onGenerateOutput: (
        extension: string,
        selectedLayoutID: string | undefined,
        outputSettingsId: string | undefined,
    ) => Promise<{ extensionType: string; outputData: Blob }>;
    editorLink?: string;
    onFetchOutputSettings: (_?: string) => Promise<UserInterfaceWithOutputSettings | null>;
    onFetchUserInterfaces: () => Promise<PaginatedResponse<UserInterface>>;
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
    environmentApiService: EnvironmentApiService;
};

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

// TODO: Remove this override when environment client API types are properly aligned
// This type combines OutputSettings and UserInterfaceOutputSettings from environment client API
export type UserInterfaceOutputSettings = Omit<EnvironmentOutputSettings, 'type' | 'watermark' | 'watermarkText'> & {
    // Override type to use DownloadFormats instead of string
    type: DownloadFormats;
    // Override layoutIntents to use string[] instead of Array<LayoutIntent> from environment client API
    // Note: Environment client API uses "Print", "DigitalStatic", "DigitalAnimated"
    // while we use "print", "digitalStatic", "digitalAnimated"
    layoutIntents: string[];
    // Make required fields that are optional in environment client API
    id: string;
    name: string;
    description: string;
    dataSourceEnabled: boolean;
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
    id: string;
    type: T;
    active: boolean;
    header: string;
    helpText: string;
}

export interface LayoutForm extends BaseFormBuilderType<'layouts'> {
    layoutSelector: boolean;
    showWidthHeightInputs: boolean;
}

export type DataSourceForm = BaseFormBuilderType<'datasource'>;
export type VariablesForm = BaseFormBuilderType<'variables'> & {
    variableGroups?: {
        show: boolean;
    };
};

export type FormBuilderArray = Array<DataSourceForm | VariablesForm | LayoutForm>;

export type FormKeys = 'datasource' | 'layouts' | 'variables';

export type FormBuilderType = {
    datasource: DataSourceForm;
    layouts: LayoutForm;
    variables: VariablesForm;
};
export type OutputSettingsType = {
    [index: string]: { layoutIntents: string[] };
};

// TODO: Remove this override when environment client API UserInterface is updated
export type APIUserInterface = Omit<EnvironmentUserInterface, 'id' | 'outputSettings' | 'default'> & {
    default: boolean;
    id: string;
    outputSettings: OutputSettingsType;
};
export type UserInterface = Omit<APIUserInterface, 'formBuilder'> & { formBuilder: FormBuilderArray };

export type PaginatedResponse<T> = {
    data: T[];
    pageSize: number;
    links?: {
        nextPage: string;
    };
};

// TODO: Remove this override when environment client API OutputSettings is updated
export type IOutputSetting = Omit<
    EnvironmentOutputSettings,
    'id' | 'watermarkText' | 'default' | 'description' | 'type' | 'dataSourceEnabled' | 'watermark'
> & {
    watermarkText: string;
    default: boolean;
    description: string;
    watermark: boolean;
    id: string;
    type: DownloadFormats;
    dataSourceEnabled: boolean;
};

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
    html: true,
};

export const defaultFormBuilder: FormBuilderType = {
    datasource: {
        id: 'Datasource',
        type: 'datasource',
        active: true,
        header: 'Data source',
        helpText: '',
    },
    layouts: {
        id: 'Layouts',
        type: 'layouts',
        active: true,
        header: 'Layouts',
        helpText: '',
        layoutSelector: true,
        showWidthHeightInputs: true,
    },
    variables: {
        id: 'Variables',
        type: 'variables',
        active: true,
        header: 'Customize',
        helpText: '',
    },
};

// eslint-disable-next-line no-restricted-globals
export const defaultBackFn = () => history.back();

export type Project = Omit<EnvironmentProject, 'name' | 'id' | 'template'> & {
    // TODO: Remove this override when environment client API Project updates name, id, template to become required
    name: string;
    id: string;
    template: { id: string };
};

export interface IDefaultStudioUILoaderConfig {
    selector: string;

    editorLink?: string;

    projectId: string;
    graFxStudioEnvironmentApiBaseUrl: string;

    authToken: string;
    refreshTokenAction?: () => Promise<string | Error>;
}
export interface IStudioUILoaderConfig {
    selector: string;
    projectId?: string;
    graFxStudioEnvironmentApiBaseUrl: string;
    authToken: string;
    projectName: string;
    refreshTokenAction?: () => Promise<string | Error>;
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
    onEngineInitialized?: (project: Project) => void;
    onProjectLoaded?: () => void;
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
    onLoadError?: (error: Error) => void;
}

export type PageSnapshot = {
    id: string;
    snapshot: Uint8Array;
};

export type MobileTrayHeaderDetails = {
    title: string;
    helpText: string;
};

export type MobileTrayFormBuilderHeader = {
    datasource: MobileTrayHeaderDetails;
    variables: MobileTrayHeaderDetails;
    layouts: MobileTrayHeaderDetails;
};

export type GenerateOutputResponse = {
    data: {
        taskId: string;
    };
    links: {
        taskInfo: string;
    };
};
export type GenerateOutputTaskPollingResponse = {
    data: {
        taskId: string;
    };
    links: {
        download: string;
    };
} | null;

export type ApiError = {
    type: string;
    title: string;
    status: string;
    detail: string;
    exceptionDetails?: string;
};
