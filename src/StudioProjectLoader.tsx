import { DownloadFormats, WellKnownConfigurationKeys } from '@chili-publish/studio-sdk';
import axios, { AxiosError, AxiosResponse } from 'axios';
import {
    ConnectorsApi,
    ProjectsApi,
    UserInterfacesApi,
    SettingsApi,
    OutputApi,
} from '@chili-publish/environment-client-api';
import {
    APIUserInteface,
    DownloadLinkResult,
    IOutputSetting,
    PaginatedResponse,
    Project,
    UserInterface,
    UserInterfaceOutputSettings,
    UserInterfaceWithOutputSettings,
} from './types/types';
import { SESSION_USER_INTEFACE_ID_KEY } from './utils/constants';
import { addTrailingSlash, getDownloadLink } from './utils/documentExportHelper';
import { transformFormBuilderArrayToObject } from './utils/helpers';

export class StudioProjectLoader {
    private projectDownloadUrl?: string;

    private projectUploadUrl?: string;

    private projectId?: string;

    private graFxStudioEnvironmentApiBaseUrl: string;

    private authToken: string;

    private sandboxMode: boolean;

    private refreshTokenAction?: () => Promise<string | AxiosError>;

    private cachedProject: Project | undefined;

    private userInterfaceID?: string;

    private onFetchUserInterfaceDetails?: (userInterfaceId: string) => Promise<UserInterface>;

    // Environment Client API instances
    private connectorsApi!: ConnectorsApi;

    private projectsApi!: ProjectsApi;

    private userInterfacesApi!: UserInterfacesApi;

    private settingsApi!: SettingsApi;

    private outputApi!: OutputApi;

    private environment!: string;

    constructor(
        projectId: string | undefined,
        graFxStudioEnvironmentApiBaseUrl: string,
        authToken: string,
        sandboxMode: boolean,
        environmentClientApis: {
            connectorsApi: ConnectorsApi;
            projectsApi: ProjectsApi;
            userInterfacesApi: UserInterfacesApi;
            settingsApi: SettingsApi;
            outputApi: OutputApi;
            environment: string;
        },
        refreshTokenAction?: () => Promise<string | AxiosError>,
        projectDownloadUrl?: string,
        projectUploadUrl?: string,
        userInterfaceID?: string,
        onFetchUserInterfaceDetails?: (userInterfaceId: string) => Promise<UserInterface>,
    ) {
        this.projectDownloadUrl = projectDownloadUrl;
        this.projectUploadUrl = projectUploadUrl;
        this.projectId = projectId;
        this.sandboxMode = sandboxMode;
        this.graFxStudioEnvironmentApiBaseUrl = graFxStudioEnvironmentApiBaseUrl;
        this.authToken = authToken;
        this.refreshTokenAction = refreshTokenAction;
        this.userInterfaceID = userInterfaceID;
        this.onFetchUserInterfaceDetails = onFetchUserInterfaceDetails;

        // Use provided API instances
        this.connectorsApi = environmentClientApis.connectorsApi;
        this.projectsApi = environmentClientApis.projectsApi;
        this.userInterfacesApi = environmentClientApis.userInterfacesApi;
        this.settingsApi = environmentClientApis.settingsApi;
        this.outputApi = environmentClientApis.outputApi;
        this.environment = environmentClientApis.environment;
    }

    public onProjectInfoRequested = async (): Promise<Project> => {
        if (!this.projectId) throw new Error('Project id was not provided');

        if (this.cachedProject) {
            return this.cachedProject;
        }

        try {
            const result = await this.projectsApi.apiV1EnvironmentEnvironmentProjectsProjectIdGet({
                environment: this.environment,
                projectId: this.projectId,
            });

            this.cachedProject = result as Project;

            if (!this.cachedProject) {
                throw new Error('Project not found');
            }

            return this.cachedProject;
        } catch (error) {
            throw new Error('Project not found');
        }
    };

    public onProjectDocumentRequested = async (): Promise<string | null> => {
        if (this.projectDownloadUrl) return StudioProjectLoader.fetchDocument(this.projectDownloadUrl, this.authToken);

        if (!this.projectId) throw new Error('Document could not be loaded (project id was not provided)');

        try {
            const result = await this.projectsApi.apiV1EnvironmentEnvironmentProjectsProjectIdDocumentGet({
                environment: this.environment,
                projectId: this.projectId,
            });
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
        await this.saveDocument(generateJson, this.projectUploadUrl, this.projectDownloadUrl, this.authToken);
        return this.onProjectInfoRequested();
    };

    public onAuthenticationRequested = (): string => {
        return this.authToken;
    };

    public onAuthenticationExpired = async (): Promise<string> => {
        if (!this.refreshTokenAction) {
            throw new Error('The authentication token has expired, and a method to obtain a new one is not provided.');
        }
        const result = await this.refreshTokenAction();
        if (result instanceof Error) {
            throw result;
        }
        this.authToken = result;
        return result;
    };

    public onLogInfoRequested = (): unknown => {
        return {
            projectDownloadUrl: this.projectDownloadUrl,
            projectUploadUrl: this.projectUploadUrl,
            projectId: this.projectId,
            graFxStudioEnvironmentApiBaseUrl: this.graFxStudioEnvironmentApiBaseUrl,
        };
    };

    public onProjectGetDownloadLink = async (
        extension: string,
        selectedLayoutID: string | undefined,
        outputSettingsId: string | undefined,
    ): Promise<DownloadLinkResult> => {
        return getDownloadLink(
            extension as DownloadFormats,
            this.graFxStudioEnvironmentApiBaseUrl,
            () => this.authToken,
            selectedLayoutID || '0',
            this.projectId,
            outputSettingsId,
            this.sandboxMode,
        );
    };

    private static fetchDocument = async (templateUrl: string, token: string): Promise<string | null> => {
        const url = templateUrl;
        if (url) {
            const fetchPromise = axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            return fetchPromise
                .then((res) => {
                    return JSON.stringify(res.data);
                })
                .catch(() => {
                    return null;
                });
        }
        return null;
    };

    private saveDocument = async (
        generateJson: () => Promise<string>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _projectUploadUrl: string | undefined,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _projectDownloadUrl: string | undefined,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _token: string,
    ): Promise<void> => {
        try {
            const document = await generateJson().then((res) => {
                if (res) {
                    return res;
                }
                throw new Error();
            });

            if (document && this.projectId) {
                try {
                    await this.projectsApi.apiV1EnvironmentEnvironmentProjectsProjectIdDocumentPut({
                        environment: this.environment,
                        projectId: this.projectId,
                        requestBody: JSON.parse(document),
                    });
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error(`[${this.saveDocument.name}] There was an issue saving document`);
                    throw err;
                }
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`[${this.saveDocument.name}] There was an issue fetching the current document state`);
            throw error;
        }
    };

    public onFetchStudioUserInterfaceDetails = async (
        userInterfaceId = this.userInterfaceID,
    ): Promise<UserInterfaceWithOutputSettings | null> => {
        const fetchDefaultUserInterface = async () => {
            const res = await this.onFetchUserInterfaces();

            if (res.status === 200) {
                return res.data.data.find((value: UserInterface) => value.default);
            }
            throw new Error(`Default user interface not found`);
        };

        const fetchUserInterfaceDetails = async (requestedUserInterfaceId: string) => {
            try {
                const result = await this.userInterfacesApi.apiV1EnvironmentEnvironmentUserInterfacesUserInterfaceIdGet(
                    {
                        environment: this.environment,
                        userInterfaceId: requestedUserInterfaceId,
                    },
                );
                return StudioProjectLoader.toUserInterface(result as APIUserInteface);
            } catch (err: unknown) {
                if ((err as { status?: number }).status === 404) {
                    return fetchDefaultUserInterface();
                }
                throw new Error(`${err}`);
            }
        };
        const outputSettings = await this.outputApi.apiV1EnvironmentEnvironmentOutputSettingsGet({
            environment: this.environment,
        });

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
                        layoutIntents: userInterface.outputSettings[outputSettingId].layoutIntents,
                    } as UserInterfaceOutputSettings;
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
                    id: userInterfaceData.id,
                    name: userInterfaceData.name,
                },
                outputSettings: mapOutPutSettingsToLayoutIntent(userInterfaceData),
                formBuilder: transformFormBuilderArrayToObject(userInterfaceData.formBuilder),
                outputSettingsFullList: (outputSettings.data || []) as IOutputSetting[],
            };
        }
        if (this.sandboxMode) {
            const defaultUserInterface = await fetchDefaultUserInterface();
            return defaultUserInterface
                ? {
                      userInterface: { id: defaultUserInterface.id, name: defaultUserInterface.name },
                      outputSettings: mapOutPutSettingsToLayoutIntent(defaultUserInterface),
                      formBuilder: transformFormBuilderArrayToObject(defaultUserInterface.formBuilder),
                      outputSettingsFullList: (outputSettings.data || []) as IOutputSetting[],
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

    public onFetchUserInterfaces = async (): Promise<AxiosResponse<PaginatedResponse<UserInterface>, unknown>> => {
        const res = await this.userInterfacesApi.apiV1EnvironmentEnvironmentUserInterfacesGet({
            environment: this.environment,
        });

        // Transform the response to match the expected format
        const transformedData = {
            data:
                res.data?.map((apiUserInterface) =>
                    StudioProjectLoader.toUserInterface(apiUserInterface as APIUserInteface),
                ) || [],
        };

        return {
            data: transformedData,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {},
        } as AxiosResponse<PaginatedResponse<UserInterface>, unknown>;
    };

    private static toUserInterface(apiUserInterface: APIUserInteface): UserInterface {
        return {
            ...apiUserInterface,
            formBuilder: apiUserInterface.formBuilder ? JSON.parse(apiUserInterface.formBuilder) : undefined,
        };
    }
}
