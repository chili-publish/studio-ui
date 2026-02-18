import { DownloadFormats, WellKnownConfigurationKeys } from '@chili-publish/studio-sdk';
import {
    APIUserInterface,
    DownloadLinkResult,
    PaginatedResponse,
    Project,
    UserInterface,
    UserInterfaceOutputSettings,
    UserInterfaceWithOutputSettings,
} from './types/types';
import { SESSION_USER_INTEFACE_ID_KEY } from './utils/constants';
import { addTrailingSlash, exportDocument } from './utils/documentExportHelper';
import { transformFormBuilderArrayToObject } from './utils/helpers';
import { EnvironmentApiService } from './services/EnvironmentApiService';
import { ProjectDataClient } from './services/ProjectDataClient';

export class StudioProjectLoader {
    private projectDownloadUrl?: string;

    private projectUploadUrl?: string;

    private projectId?: string;

    private graFxStudioEnvironmentApiBaseUrl: string;

    private sandboxMode: boolean;

    private componentMode: boolean;

    private cachedProject: Project | undefined;

    private userInterfaceID?: string;

    private onFetchUserInterfaceDetails?: (userInterfaceId: string) => Promise<UserInterface>;

    private onProjectGetDownloadLink?: (
        extension: string,
        selectedLayoutID: string | undefined,
        outputSettingsId: string | undefined,
    ) => Promise<DownloadLinkResult>;

    // Centralized Environment API Service
    private environmentApiService: EnvironmentApiService;

    // Client for project data requests
    private projectDataClient: ProjectDataClient;

    constructor(
        projectId: string | undefined,
        graFxStudioEnvironmentApiBaseUrl: string,
        sandboxMode: boolean,
        componentMode: boolean,
        environmentApiService: EnvironmentApiService,
        projectDownloadUrl?: string,
        projectUploadUrl?: string,
        userInterfaceID?: string,
        onFetchUserInterfaceDetails?: (userInterfaceId: string) => Promise<UserInterface>,
        onProjectGetDownloadLink?: (
            extension: string,
            selectedLayoutID: string | undefined,
            outputSettingsId: string | undefined,
        ) => Promise<DownloadLinkResult>,
    ) {
        this.projectDownloadUrl = projectDownloadUrl;
        this.projectUploadUrl = projectUploadUrl;
        this.projectId = projectId;
        this.sandboxMode = sandboxMode;
        this.componentMode = componentMode;
        this.graFxStudioEnvironmentApiBaseUrl = graFxStudioEnvironmentApiBaseUrl;
        this.userInterfaceID = userInterfaceID;
        this.onFetchUserInterfaceDetails = onFetchUserInterfaceDetails;
        this.onProjectGetDownloadLink = onProjectGetDownloadLink;
        this.environmentApiService = environmentApiService;

        this.projectDataClient = new ProjectDataClient();
    }

    public onProjectInfoRequested = async (): Promise<Project> => {
        if (!this.projectId) throw new Error('Project id was not provided');

        if (this.cachedProject) {
            return this.cachedProject;
        }

        try {
            const result = await this.environmentApiService.getProjectById(this.projectId);

            // Transform environment client API Project to our consolidated Project type
            this.cachedProject = {
                id: result.id || '',
                name: result.name || '',
                template: { id: result.template?.id || '' },
                collectionId: result.collectionId,
                userInterfaceId: result.userInterfaceId,
            };

            if (!this.cachedProject) {
                throw new Error('Project not found');
            }

            return this.cachedProject;
        } catch (error) {
            throw new Error('Project not found');
        }
    };

    public onProjectDocumentRequested = async (): Promise<string | null> => {
        // Use URL-based approach if download URL is provided
        if (this.projectDownloadUrl) {
            return this.projectDataClient.fetchFromUrl(this.projectDownloadUrl);
        }

        // Use API-based approach if no download URL
        if (!this.projectId) throw new Error('Document could not be loaded (project id was not provided)');

        try {
            const result = await this.environmentApiService.getProjectDocument(this.projectId);
            return JSON.stringify(result);
        } catch (error) {
            return null;
        }
    };

    public onEngineInitialized = (): void => {
        window.StudioUISDK.configuration.setValue(
            WellKnownConfigurationKeys.GraFxStudioEnvironmentApiUrl,
            addTrailingSlash(this.graFxStudioEnvironmentApiBaseUrl),
        );
    };

    public onProjectSave = async (generateJson: () => Promise<string>): Promise<Project> => {
        await this.saveDocument(generateJson);
        return this.onProjectInfoRequested();
    };

    public onLogInfoRequested = (): unknown => {
        return {
            projectDownloadUrl: this.projectDownloadUrl,
            projectUploadUrl: this.projectUploadUrl,
            projectId: this.projectId,
            graFxStudioEnvironmentApiBaseUrl: this.graFxStudioEnvironmentApiBaseUrl,
        };
    };

    public onFetchStudioUserInterfaceDetails = async (
        userInterfaceId = this.userInterfaceID,
    ): Promise<UserInterfaceWithOutputSettings | null> => {
        const fetchDefaultUserInterface = async () => {
            try {
                const res = await this.onFetchUserInterfaces();
                return res.data.find((value: UserInterface) => value.default);
            } catch (error) {
                throw new Error(`Default user interface not found`);
            }
        };

        const fetchUserInterfaceDetails = async (requestedUserInterfaceId: string) => {
            try {
                const result = await this.environmentApiService.getUserInterfaceById(requestedUserInterfaceId);
                return StudioProjectLoader.toUserInterface(result);
            } catch (err: unknown) {
                if ((err as { status?: number }).status === 404) {
                    return fetchDefaultUserInterface();
                }
                throw new Error(`${err}`);
            }
        };
        const outputSettings = await this.environmentApiService.getOutputSettings();

        const mapOutPutSettingsToLayoutIntent = (userInterface: UserInterface) => {
            const mappedOutputSettings: UserInterfaceOutputSettings[] = [];
            if (!userInterface.outputSettings) return mappedOutputSettings;

            Object.keys(userInterface.outputSettings).forEach((outputSettingId) => {
                const matchedOutputSetting = outputSettings.data?.find(
                    (outputSetting) => outputSetting.id === outputSettingId,
                );
                if (matchedOutputSetting) {
                    const final = {
                        ...matchedOutputSetting,
                        id: matchedOutputSetting.id || '',
                        layoutIntents: userInterface.outputSettings?.[outputSettingId].layoutIntents,
                    };
                    mappedOutputSettings.push(final);
                }
            });
            return mappedOutputSettings;
        };
        // userInterfaceID from projectConfig or session-stored userInterfaceId
        const currentUserInterfaceId = userInterfaceId || sessionStorage.getItem(SESSION_USER_INTEFACE_ID_KEY);
        if (currentUserInterfaceId) {
            let userInterfaceData: UserInterface | undefined;
            if (this.onFetchUserInterfaceDetails) {
                // There is no any fallback behaviour for custom implementation as it might not be intended by the integrators
                // So for any error happening we just return the failure
                userInterfaceData = await this.onFetchUserInterfaceDetails(currentUserInterfaceId);
            } else {
                userInterfaceData = await fetchUserInterfaceDetails(currentUserInterfaceId);
            }

            if (!userInterfaceData) {
                return null;
            }

            return {
                userInterface: {
                    id: userInterfaceData.id || '',
                    name: userInterfaceData.name,
                },
                outputSettings: mapOutPutSettingsToLayoutIntent(userInterfaceData),
                formBuilder: transformFormBuilderArrayToObject(userInterfaceData.formBuilder),
                outputSettingsFullList: outputSettings.data || [],
            };
        }
        if (this.sandboxMode && !this.componentMode) {
            const defaultUserInterface = await fetchDefaultUserInterface();
            return defaultUserInterface
                ? {
                      userInterface: { id: defaultUserInterface.id || '', name: defaultUserInterface.name },
                      outputSettings: mapOutPutSettingsToLayoutIntent(defaultUserInterface),
                      formBuilder: transformFormBuilderArrayToObject(defaultUserInterface.formBuilder),
                      outputSettingsFullList: outputSettings.data || [],
                  }
                : null;
        }
        return null;
    };

    /**
     * @deprecated This method is deprecated and will be removed in a future version.
     * Please use onFetchStudioUserInterfaceDetails() instead which provides the same functionality
     */
    public onFetchOutputSettings = async (
        userInterfaceId = this.userInterfaceID,
    ): Promise<UserInterfaceWithOutputSettings | null> => {
        const userInterfaceDetails = await this.onFetchStudioUserInterfaceDetails(userInterfaceId);
        return userInterfaceDetails;
    };

    public onFetchUserInterfaces = async (): Promise<PaginatedResponse<UserInterface>> => {
        const res = await this.environmentApiService.getAllUserInterfaces();

        return {
            ...res,
            data: res.data.map((apiUserInterface) => StudioProjectLoader.toUserInterface(apiUserInterface)),
        };
    };

    public onGenerateOutput = async (
        extension: string,
        selectedLayoutID: string | undefined,
        outputSettingsId: string | undefined,
    ): Promise<{ extensionType: string; outputData: Blob }> => {
        if (this.onProjectGetDownloadLink) {
            const result = await this.onProjectGetDownloadLink(extension, selectedLayoutID, outputSettingsId);
            if (result.status !== 200 || !result.data) {
                throw new Error('Error getting download link');
            }
            return this.projectDataClient.downloadFromUrl(result.data);
        }
        const taskId = await this.getTaskId(extension, selectedLayoutID, outputSettingsId);
        return this.environmentApiService.getOutputTaskResult(taskId);
    };

    private getTaskId = async (
        extension: string,
        selectedLayoutID: string | undefined,
        outputSettingsId: string | undefined,
    ): Promise<string> => {
        const result = await exportDocument(
            extension as DownloadFormats,
            selectedLayoutID || '0',
            this.projectId,
            outputSettingsId,
            this.sandboxMode,
            this.environmentApiService,
        );
        if (typeof result !== 'string') {
            throw new Error(`Error getting download link:${result.error}`);
        }
        return result;
    };

    private saveDocument = async (generateJson: () => Promise<string>): Promise<void> => {
        try {
            const document = await generateJson().then((res) => {
                if (res) {
                    return res;
                }
                throw new Error();
            });

            const requestUrl =
                this.projectDownloadUrl ||
                (this.projectUploadUrl ? `${this.projectUploadUrl}/assets/assets/documents/demo.json` : null);

            try {
                if (requestUrl) {
                    await this.projectDataClient.saveToUrl(requestUrl, document);
                } else if (document && this.projectId) {
                    await this.environmentApiService.saveProjectDocument(this.projectId, JSON.parse(document));
                }
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error(`[${this.saveDocument.name}] There was an issue saving document`);
                throw err;
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`[${this.saveDocument.name}] There was an issue fetching the current document state`);
            throw error;
        }
    };

    private static toUserInterface(apiUserInterface: APIUserInterface): UserInterface {
        return {
            ...apiUserInterface,
            formBuilder: apiUserInterface.formBuilder ? JSON.parse(apiUserInterface.formBuilder) : undefined,
        };
    }
}
