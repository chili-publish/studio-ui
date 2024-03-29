import axios, { AxiosError } from 'axios';
import { DownloadFormats, WellKnownConfigurationKeys } from '@chili-publish/studio-sdk';
import { DownloadLinkResult, HttpHeaders, IOutputSetting, Project, UserInterfaceOutputSettings } from './types/types';
import { getDownloadLink } from './utils/documentExportHelper';

export class StudioProjectLoader {
    private projectDownloadUrl?: string;

    private projectUploadUrl?: string;

    private projectId: string;

    private graFxStudioEnvironmentApiBaseUrl: string;

    private authToken: string;

    private refreshTokenAction: () => Promise<string | AxiosError>;

    private cachedProject: Project | undefined;

    private userInterfaceID?: string;

    constructor(
        projectId: string,
        graFxStudioEnvironmentApiBaseUrl: string,
        authToken: string,
        refreshTokenAction: () => Promise<string | AxiosError>,
        projectDownloadUrl?: string,
        projectUploadUrl?: string,
        userInterfaceID?: string,
    ) {
        this.projectDownloadUrl = projectDownloadUrl;
        this.projectUploadUrl = projectUploadUrl;
        this.projectId = projectId;
        this.graFxStudioEnvironmentApiBaseUrl = graFxStudioEnvironmentApiBaseUrl;
        this.authToken = authToken;
        this.refreshTokenAction = refreshTokenAction;
        this.userInterfaceID = userInterfaceID;
    }

    public onProjectInfoRequested = async (): Promise<Project> => {
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

    public onProjectDocumentRequested = async (): Promise<string> => {
        const fallbackDownloadUrl = `${this.graFxStudioEnvironmentApiBaseUrl}/projects/${this.projectId}/document`;
        return StudioProjectLoader.fetchDocument(this.projectDownloadUrl ?? fallbackDownloadUrl, this.authToken);
    };

    public onProjectLoaded = (): void => {
        window.SDK.configuration.setValue(
            WellKnownConfigurationKeys.GraFxStudioEnvironmentApiUrl,
            this.graFxStudioEnvironmentApiBaseUrl ?? '',
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
    ): Promise<DownloadLinkResult> => {
        return getDownloadLink(
            extension as DownloadFormats,
            this.graFxStudioEnvironmentApiBaseUrl ?? '',
            this.authToken ?? '',
            selectedLayoutID || '0',
            this.projectId ?? '',
        );
    };

    private static fetchDocument = async (templateUrl?: string, token?: string): Promise<string> => {
        const url = templateUrl;
        if (url) {
            const fetchPromise = token
                ? axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
                : axios.get(url);
            return fetchPromise
                .then((response) => {
                    return response;
                })
                .then((res) => {
                    return JSON.stringify(res.data);
                })
                .catch(() => {
                    return '{}';
                });
        }
        return '{}';
    };

    private saveDocument = async (
        generateJson: () => Promise<string>,
        docEditorLink?: string,
        templateUrl?: string,
        token?: string,
    ) => {
        // create a fallback url in case projectDownloadUrl and projectUploadUrl were not provided
        const fallbackDownloadUrl = `${this.graFxStudioEnvironmentApiBaseUrl}/projects/${this.projectId}/document`;
        const url =
            templateUrl ||
            (docEditorLink ? `${docEditorLink}/assets/assets/documents/demo.json` : null) ||
            fallbackDownloadUrl;

        if (!url) return;
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
                },
            };

            if (token) {
                config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
            }
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

    public onFetchOutputSettings = async (): Promise<UserInterfaceOutputSettings[] | null> => {
        if (this.userInterfaceID) {
            const outputSettings = await axios.get(`${this.graFxStudioEnvironmentApiBaseUrl}/output/settings`, {
                headers: { Authorization: `Bearer ${this.authToken}` },
            });
            const userInterface = await axios.get(
                `${this.graFxStudioEnvironmentApiBaseUrl}/user-interfaces/${this.userInterfaceID}`,
                { headers: { Authorization: `Bearer ${this.authToken}` } },
            );
            const mappedOutputSettings: UserInterfaceOutputSettings[] = [];

            Object.keys(userInterface.data.outputSettings).forEach((outputSettingId) => {
                const matchedOutputSetting = outputSettings.data.data.find(
                    (outputSetting: IOutputSetting) => outputSetting.id === outputSettingId,
                );
                if (matchedOutputSetting) {
                    const final = {
                        ...matchedOutputSetting,
                        layoutIntents: userInterface.data.outputSettings[outputSettingId].layoutIntents,
                    };
                    mappedOutputSettings.push(final);
                }
            });

            return mappedOutputSettings;
        }
        return null;
    };
}
