import { DownloadFormats, Id } from '@chili-publish/studio-sdk';
import { DataConnectorConfiguration } from '../types/OutputGenerationTypes';
import { DownloadLinkResult } from '../types/types';
import { getConnectorConfigurationOptions, getEnvId } from './connectors';
import { EnvironmentApiService } from '../services/EnvironmentApiService';

/**
 * This method will call an external api to create a download url using environment client API
 * The video will be generated in the dimensions (and resolution) of the layout.
 * This means that any upscaling (e.g. playing the video full screen on a 4k monitor) will result in interpolation (= quality loss).
 * @param format The format of a downloadable url
 * @param layoutId id of layout to be downloaded
 * @param environmentApiService Environment API service instance
 * @returns the download link
 */
export const getDownloadLink = async (
    format: DownloadFormats,
    getToken: () => string,
    layoutId: Id,
    projectId: Id | undefined,
    outputSettingsId: string | undefined,
    isSandboxMode: boolean,
    environmentApiService: EnvironmentApiService,
): Promise<DownloadLinkResult> => {
    try {
        const documentResponse = await window.StudioUISDK.document.getCurrentState();
        let engineVersion: string | null = null;

        if (!window.location.hostname.endsWith('chiligrafx.com')) {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            engineVersion = urlParams.get('engine');
            const engineCommitSha = urlParams.get('engineCommitSha');
            if (engineVersion) {
                if (/^\d+$/.test(engineVersion)) {
                    engineVersion = `prs/${engineVersion}`;
                }
            } else {
                engineVersion = (documentResponse.parsedData as unknown as { engineVersion: string })?.engineVersion;
            }
            if (engineCommitSha) engineVersion += `-${engineCommitSha}`;
        }

        const dataConnectorConfig = await getDataSourceConfigWithEnvironmentApi(
            outputSettingsId,
            environmentApiService,
        );

        const body = documentResponse.data as string;
        const requestBody = {
            outputSettingsId,
            layoutsToExport: [layoutId],
            engineVersion,
            documentContent: JSON.parse(body),
            dataConnectorConfig,
            ...(isSandboxMode ? { templateId: projectId } : { projectId }),
        };

        const response = await environmentApiService.generateOutput(format, requestBody);

        if ('status' in response) {
            const err = response as { status: string; detail: string }; // TODO: Type this properly when environment client API types are updated
            return {
                status: Number.parseInt(err.status),
                error: err.detail,
                success: false,
                parsedData: undefined,
                data: undefined,
            };
        }

        const data = response as { links: { taskInfo: string } }; // TODO: Type this properly when environment client API types are updated
        const pollingResult = await startPollingOnEndpoint(data.links.taskInfo, environmentApiService, getToken);

        if (pollingResult === null) {
            return {
                status: 500,
                error: 'Error during polling',
                success: false,
                parsedData: undefined,
                data: undefined,
            };
        }

        return {
            status: 200,
            success: true,
            parsedData: pollingResult.links.download,
            data: pollingResult.links.download,
            error: undefined,
        };
    } catch {
        return {
            status: 500,
            error: 'Unexpected error during polling',
            success: false,
            parsedData: undefined,
            data: undefined,
        };
    }
};

/**
 * This method will call the environment client API to check task status until the task is completed
 * @param taskInfoUrl URL containing the task info endpoint
 * @param environmentApiService Environment API service instance
 * @returns task result when completed
 */
const startPollingOnEndpoint = async (
    taskInfoUrl: string,
    environmentApiService: EnvironmentApiService,
    getToken: () => string,
): Promise<GenerateAnimationTaskPollingResponse | null> => {
    try {
        // Extract task ID from the task info URL
        // The URL format is typically: https://api.example.com/v1/environment/{environment}/output/tasks/{taskId}
        const urlParts = taskInfoUrl.split('/');
        const taskId = urlParts[urlParts.length - 1];

        if (!taskId) {
            // eslint-disable-next-line no-console
            console.error('Could not extract task ID from URL:', taskInfoUrl);
            return null;
        }

        // Use environment client API to get task status
        const taskStatus = await environmentApiService.getTaskStatus(taskId);

        if (taskStatus === null) {
            // Task is still in progress, wait and poll again
            // eslint-disable-next-line no-promise-executor-return
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return await startPollingOnEndpoint(taskInfoUrl, environmentApiService, getToken);
        }

        return taskStatus as GenerateAnimationTaskPollingResponse;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error polling task status:', err);
        return null;
    }
};

const getDataSourceConfigWithEnvironmentApi = async (
    outputSettingsId: string | undefined,
    environmentApiService: EnvironmentApiService,
): Promise<DataConnectorConfiguration | undefined> => {
    if (!outputSettingsId) {
        return undefined;
    }
    const { parsedData: dataSource } = await window.StudioUISDK.dataSource.getDataSource();
    if (!dataSource) {
        return undefined;
    }

    const setting = await environmentApiService.getOutputSettingsById(outputSettingsId);

    if (!(setting as { dataSourceEnabled: boolean }).dataSourceEnabled) {
        // TODO: Type this properly when environment client API types are updated
        return undefined;
    }
    return {
        dataConnectorId: getEnvId(dataSource),
        dataConnectorParameters: {
            context: await getConnectorConfigurationOptions(dataSource.id),
        },
    };
};

type GenerateAnimationTaskPollingResponse = {
    data: {
        taskId: string;
    };
    links: {
        download: string;
    };
};

/**
 * This method will check if a string has a trailing slash
 * @param incomingUrl string to check
 * @returns the string with a trailing slash
 */
export const addTrailingSlash = (incomingUrl: string): string => {
    return incomingUrl.endsWith('/') ? incomingUrl : `${incomingUrl}/`;
};

export default { getDownloadLink, addTrailingSlash };
