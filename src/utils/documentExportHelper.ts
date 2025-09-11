import { DownloadFormats, Id } from '@chili-publish/studio-sdk';
import axios from 'axios';
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
        const pollingResult = await startPollingOnEndpointWithEnvironmentApi(
            data.links.taskInfo,
            environmentApiService,
            getToken,
        );

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
 * This method will call an external api endpoint using environment client API, until the api endpoint returns a status code 200
 * @param endpoint api endpoint to start polling on
 * @param environmentApiService Environment API service instance
 * @returns true when the endpoint call has successfully been resolved
 */
const startPollingOnEndpointWithEnvironmentApi = async (
    endpoint: string,
    environmentApiService: EnvironmentApiService,
    getToken: () => string,
): Promise<GenerateAnimationTaskPollingResponse | null> => {
    try {
        // For polling, we still need to use axios since the environment client API doesn't have a generic GET method
        // and the polling endpoint is dynamic
        const httpResponse = await axios.get(endpoint, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (httpResponse.status === 202) {
            // eslint-disable-next-line no-promise-executor-return
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return await startPollingOnEndpointWithEnvironmentApi(endpoint, environmentApiService, getToken);
        }
        if (httpResponse.status === 200) {
            return httpResponse.data as GenerateAnimationTaskPollingResponse;
        }
        return null;
    } catch (err) {
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
