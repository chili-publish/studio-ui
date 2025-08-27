import { DownloadFormats, Id } from '@chili-publish/studio-sdk';
import { DataConnectorConfiguration } from '../types/OutputGenerationTypes';
import { DownloadLinkResult } from '../types/types';
import { getConnectorConfigurationOptions, getEnvId } from './connectors';

// Environment API methods interface
interface EnvironmentApiMethods {
    generatePngOutput: (requestBody: {
        [key: string]: unknown;
    }) => Promise<{ data: { taskId: string }; links: { taskInfo: string } }>;
    generateJpgOutput: (requestBody: {
        [key: string]: unknown;
    }) => Promise<{ data: { taskId: string }; links: { taskInfo: string } }>;
    generatePdfOutput: (requestBody: {
        [key: string]: unknown;
    }) => Promise<{ data: { taskId: string }; links: { taskInfo: string } }>;
    generateMp4Output: (requestBody: {
        [key: string]: unknown;
    }) => Promise<{ data: { taskId: string }; links: { taskInfo: string } }>;
    generateGifOutput: (requestBody: {
        [key: string]: unknown;
    }) => Promise<{ data: { taskId: string }; links: { taskInfo: string } }>;
    getTaskStatus: (taskId: string) => Promise<{ data: { taskId: string }; links: { download: string } }>;
    getOutputSettingById: (outputSettingsId: string) => Promise<{ dataSourceEnabled: boolean }>;
}

/**
 * This method will call an external api to create a download url
 * The video will be generated in the dimensions (and resolution) of the layout.
 * This means that any upscaling (e.g. playing the video full screen on a 4k monitor) will result in interpolation (= quality loss).
 * @param format The format of a downloadable url
 * @param layoutId id of layout to be downloaded
 * @returns the download link
 */
export const getDownloadLink = async (
    format: DownloadFormats,
    baseUrl: string,
    getToken: () => string,
    layoutId: Id,
    projectId: Id | undefined,
    outputSettingsId: string | undefined,
    isSandboxMode: boolean,
    environmentApiMethods: EnvironmentApiMethods,
): Promise<DownloadLinkResult> => {
    try {
        const documentResponse = await window.StudioUISDK.document.getCurrentState();
        const generateExportUrl = `${baseUrl}/output/${format}`;
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

        const dataConnectorConfig = await getDataSourceConfig(outputSettingsId, environmentApiMethods);

        const body = documentResponse.data as string;
        const requestBody = {
            outputSettingsId,
            layoutsToExport: [layoutId],
            engineVersion,
            documentContent: JSON.parse(body),
            dataConnectorConfig,
            ...(isSandboxMode ? { templateId: projectId } : { projectId }),
        };

        // Use environment client API based on format
        let response: GenerateAnimationResponse | ApiError;

        try {
            switch (format) {
                case 'png':
                    response = await environmentApiMethods.generatePngOutput(requestBody);
                    break;
                case 'jpg':
                    response = await environmentApiMethods.generateJpgOutput(requestBody);
                    break;
                case 'pdf':
                    response = await environmentApiMethods.generatePdfOutput(requestBody);
                    break;
                case 'mp4':
                    response = await environmentApiMethods.generateMp4Output(requestBody);
                    break;
                case 'gif':
                    response = await environmentApiMethods.generateGifOutput(requestBody);
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            // Fallback to direct fetch if environment client API fails
            const fetchResponse = await fetch(generateExportUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!fetchResponse.ok) {
                throw new Error(`Failed to generate output: ${fetchResponse.statusText}`);
            }

            response = await fetchResponse.json();
        }

        if ('status' in response) {
            const err = response as ApiError;
            return {
                status: Number.parseInt(err.status),
                error: err.detail,
                success: false,
                parsedData: undefined,
                data: undefined,
            };
        }

        const data = response as GenerateAnimationResponse;
        const pollingResult = await startPollingOnEndpoint(data.links.taskInfo, getToken, environmentApiMethods);

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
 * This method will call an external api endpoint, untill the api endpoint returns a status code 200
 * @param endpoint api endpoint to start polling on
 * @returns true when the endpoint call has successfully been resolved
 */
const startPollingOnEndpoint = async (
    endpoint: string,
    getToken: () => string,
    environmentApiMethods: EnvironmentApiMethods,
): Promise<GenerateAnimationTaskPollingResponse | null> => {
    try {
        // Extract task ID from the endpoint URL
        const taskId = endpoint.split('/').pop();
        if (!taskId) {
            throw new Error('Could not extract task ID from endpoint');
        }

        // Use environment client API to get task status
        const result = await environmentApiMethods.getTaskStatus(taskId);

        // Check if task is still processing (202) or completed (200)
        if (result.data?.taskId) {
            // Task is completed, return the result
            return result as GenerateAnimationTaskPollingResponse;
        }

        // Task is still processing, wait and retry
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return await startPollingOnEndpoint(endpoint, getToken, environmentApiMethods);
    } catch (err) {
        // Fallback to direct fetch if environment client API fails
        try {
            const response = await fetch(endpoint, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            if (response.status === 202) {
                // eslint-disable-next-line no-promise-executor-return
                await new Promise((resolve) => setTimeout(resolve, 2000));
                return await startPollingOnEndpoint(endpoint, getToken, environmentApiMethods);
            }
            if (response.status === 200) {
                return (await response.json()) as GenerateAnimationTaskPollingResponse;
            }
        } catch (fetchErr) {
            // eslint-disable-next-line no-console
            console.warn('Both environment client API and fetch failed:', fetchErr);
        }
        return null;
    }
};

const getDataSourceConfig = async (
    outputSettingsId: string | undefined,
    environmentApiMethods: EnvironmentApiMethods,
): Promise<DataConnectorConfiguration | undefined> => {
    if (!outputSettingsId) {
        return undefined;
    }
    const { parsedData: dataSource } = await window.StudioUISDK.dataSource.getDataSource();

    if (!dataSource) {
        return undefined;
    }

    // Use environment client API to get output setting
    const setting = await environmentApiMethods.getOutputSettingById(outputSettingsId);

    if (!setting.dataSourceEnabled) {
        return undefined;
    }
    return {
        dataConnectorId: getEnvId(dataSource),
        dataConnectorParameters: {
            context: await getConnectorConfigurationOptions(dataSource.id),
        },
    };
};

type GenerateAnimationResponse = {
    data: {
        taskId: string;
    };
    links: {
        taskInfo: string;
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

type ApiError = {
    type: string;
    title: string;
    status: string;
    detail: string;
    exceptionDetails?: string;
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
