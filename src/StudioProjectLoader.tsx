import { DownloadFormats, WellKnownConfigurationKeys } from '@chili-publish/studio-sdk';
import axios, { AxiosError, AxiosResponse } from 'axios';
import {
    APIUserInteface,
    DownloadLinkResult,
    HttpHeaders,
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

    constructor(
        projectId: string | undefined,
        graFxStudioEnvironmentApiBaseUrl: string,
        authToken: string,
        sandboxMode: boolean,
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
    }

    public onProjectInfoRequested = async (): Promise<Project> => {
        if (!this.projectId) throw new Error('Project id was not provided');

        if (this.cachedProject) {
            return this.cachedProject;
        }

        const intermediate = axios
            .get(`${this.graFxStudioEnvironmentApiBaseUrl}/projects/${this.projectId}`, {
                headers: { Authorization: `Bearer ${this.authToken}` },
            })
            .then((res) => {
                return res.data;
            });

        // cache for subsequent calls
        this.cachedProject = await intermediate;

        if (!this.cachedProject) {
            throw new Error('Project not found');
        }

        return this.cachedProject;
    };

    public onProjectDocumentRequested = async (): Promise<string | null> => {
        if (this.projectDownloadUrl) return StudioProjectLoader.fetchDocument(this.projectDownloadUrl, this.authToken);

        if (!this.projectId) throw new Error('Document could not be loaded (project id was not provided)');

        const fallbackDownloadUrl = `${this.graFxStudioEnvironmentApiBaseUrl}/projects/${this.projectId}/document`;
        return StudioProjectLoader.fetchDocument(fallbackDownloadUrl, this.authToken);
    };

    public onProjectLoaded = (): void => {
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
        // eslint-disable-next-line no-console
        console.log('setting authToken in onAuthenticationExpired', result);
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
        // eslint-disable-next-line no-console
        console.log('authToken in onProjectGetDownloadLink', this.authToken);
        return getDownloadLink(
            extension as DownloadFormats,
            this.graFxStudioEnvironmentApiBaseUrl,
            () => {
                // eslint-disable-next-line no-console
                console.log('authToken in onProjectGetDownloadLink inner fn', this.authToken);
                return this.authToken;
            },
            this,
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
        projectUploadUrl: string | undefined,
        projectDownloadUrl: string | undefined,
        token: string,
    ) => {
        // create a fallback url in case projectDownloadUrl and projectUploadUrl were not provided
        let url =
            projectDownloadUrl || (projectUploadUrl ? `${projectUploadUrl}/assets/assets/documents/demo.json` : null);

        if (!url) {
            if (!this.projectId) throw new Error('Project id was not provided');

            const fallbackDownloadUrl = `${this.graFxStudioEnvironmentApiBaseUrl}/projects/${this.projectId}/document`;
            url = fallbackDownloadUrl;
        }

        try {
            const document = await generateJson().then((res) => {
                if (res) {
                    return res;
                }
                throw new Error();
            });
            const config: HttpHeaders = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            if (document) {
                axios.put(url, JSON.parse(document), config).catch((err) => {
                    // eslint-disable-next-line no-console
                    console.error(`[${this.saveDocument.name}] There was an issue saving document`);
                    return err;
                });
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`[${this.saveDocument.name}] There was an issue fetching the current document state`);
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
            return axios
                .get<APIUserInteface>(
                    `${this.graFxStudioEnvironmentApiBaseUrl}/user-interfaces/${requestedUserInterfaceId}`,
                    {
                        headers: { Authorization: `Bearer ${this.authToken}` },
                    },
                )
                .then((res) => StudioProjectLoader.toUserInterface(res.data))
                .catch((err) => {
                    if (err.response && err.response.status === 404) {
                        return fetchDefaultUserInterface();
                    }
                    throw new Error(`${err}`);
                });
        };
        const outputSettings = await axios.get<{ data: IOutputSetting[] }>(
            `${this.graFxStudioEnvironmentApiBaseUrl}/output/settings`,
            {
                headers: { Authorization: `Bearer ${this.authToken}` },
            },
        );

        const mapOutPutSettingsToLayoutIntent = (userInterface: UserInterface) => {
            const mappedOutputSettings: UserInterfaceOutputSettings[] = [];
            if (!userInterface.outputSettings) return mappedOutputSettings;

            Object.keys(userInterface.outputSettings).forEach((outputSettingId) => {
                const matchedOutputSetting = outputSettings.data.data.find(
                    (outputSetting: IOutputSetting) => outputSetting.id === outputSettingId,
                );
                if (matchedOutputSetting) {
                    const final = {
                        ...matchedOutputSetting,
                        layoutIntents: userInterface.outputSettings[outputSettingId].layoutIntents,
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
                    id: userInterfaceData.id,
                    name: userInterfaceData.name,
                },
                outputSettings: mapOutPutSettingsToLayoutIntent(userInterfaceData),
                formBuilder: transformFormBuilderArrayToObject(userInterfaceData.formBuilder),
                outputSettingsFullList: outputSettings.data.data,
            };
        }
        if (this.sandboxMode) {
            const defaultUserInterface = await fetchDefaultUserInterface();
            return defaultUserInterface
                ? {
                      userInterface: { id: defaultUserInterface.id, name: defaultUserInterface.name },
                      outputSettings: mapOutPutSettingsToLayoutIntent(defaultUserInterface),
                      formBuilder: transformFormBuilderArrayToObject(defaultUserInterface.formBuilder),
                      outputSettingsFullList: outputSettings.data.data,
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onFetchUserInterfaces = async (): Promise<AxiosResponse<PaginatedResponse<UserInterface>, any>> => {
        const res = await axios.get<PaginatedResponse<APIUserInteface>>(
            `${this.graFxStudioEnvironmentApiBaseUrl}/user-interfaces`,
            {
                headers: { Authorization: `Bearer ${this.authToken}` },
            },
        );
        return {
            ...res,
            data: {
                ...res.data,
                data: res.data.data.map((apiUserInterface) => StudioProjectLoader.toUserInterface(apiUserInterface)),
            },
        };
    };

    private static toUserInterface(apiUserInterface: APIUserInteface): UserInterface {
        return {
            ...apiUserInterface,
            formBuilder: apiUserInterface.formBuilder ? JSON.parse(apiUserInterface.formBuilder) : undefined,
        };
    }
}
