import { DownloadFormats, Id } from '@chili-publish/studio-sdk';
import axios from 'axios';
import { DownloadLinkResult } from '../types/types';

type HttpHeaders = { method: string; body: string | null; headers: { 'Content-Type': string; Authorization?: string } };

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
    token: string,
    layoutId: Id,
    projectId: Id,
    outputSettingsId: string | undefined,
    isSandboxMode: boolean,
): Promise<DownloadLinkResult> => {
    try {
        const documentResponse = await window.StudioUISDK.document.getCurrentState();
        const generateExportUrl = `${baseUrl}/output/${format}`;
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        let engineVersion = urlParams.get('engine');
        const engineCommitSha = urlParams.get('engineCommitSha');

        if (window.location.hostname !== 'chiligrafx.com') {
            if (engineVersion) {
                if (/^\d+$/.test(engineVersion)) {
                    engineVersion = `prs/${engineVersion}`;
                }
            } else {
                engineVersion = (documentResponse.parsedData as unknown as { engineVersion: string })?.engineVersion;
            }
            if (engineCommitSha) engineVersion += `-${engineCommitSha}`;
        }

        const body = documentResponse.data as string;
        const requestBody = {
            outputSettingsId,
            layoutsToExport: [layoutId],
            engineVersion,
            documentContent: JSON.parse(body),
            ...(isSandboxMode ? { templateId: projectId } : { projectId }),
        };

        const httpResponse = await axios.post(generateExportUrl, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        const response: GenerateAnimationResponse | ApiError = httpResponse.data as
            | GenerateAnimationResponse
            | ApiError;

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
        const pollingResult = await startPollingOnEndpoint(data.links.taskInfo, token);

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
    token: string,
): Promise<GenerateAnimationTaskPollingResponse | null> => {
    try {
        const config: HttpHeaders = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: null,
        };
        const httpResponse = await axios.get(endpoint, config);

        if (httpResponse?.status === 202) {
            // eslint-disable-next-line no-promise-executor-return
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return await startPollingOnEndpoint(endpoint, token);
        }
        if (httpResponse?.status === 200) {
            return httpResponse.data as GenerateAnimationTaskPollingResponse;
        }
        return null;
    } catch (err) {
        return null;
    }
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

export default { getDownloadLink };
