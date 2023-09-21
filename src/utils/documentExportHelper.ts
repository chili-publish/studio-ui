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
    projectId: string,
): Promise<DownloadLinkResult> => {
    try {
        const documentResponse = await window.SDK.document.getCurrentState();
        let generateExportUrl = `${baseUrl}/output/`;

        // Use different URL when format is one of array ['png', 'jpg'].
        if (['png', 'jpg'].includes(format)) {
            generateExportUrl += `image?layoutToExport=${layoutId}&outputType=${format}&pixelRatio=1&projectId=${projectId}`;
        } else if (['mp4', 'gif'].includes(format)) {
            // Here we also pass additional query param `fps` with a default value of `30`.
            generateExportUrl += `animation?layoutToExport=${layoutId}&outputType=${format}&fps=30&pixelRatio=1&projectId=${projectId}`;
        } else {
            generateExportUrl = `${baseUrl.replace(
                'v1',
                'experimental',
            )}/output/pdf?layoutToExport=${layoutId}&projectId=${projectId}`;
        }

        // TODO: we tend to use this code only on DEV, we need a better way to verify it
        if (window.location.hostname !== 'chiligrafx.com') {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            let engineVersion = urlParams.get('engine');
            const engineCommitSha = urlParams.get('engineCommitSha');
            if (engineVersion) {
                if (/^\d+$/.test(engineVersion)) {
                    engineVersion = `prs/${engineVersion}`;
                }
            } else {
                engineVersion = (documentResponse.parsedData as unknown as { engineVersion: string })?.engineVersion;
            }
            generateExportUrl += `&engineVersion=${engineVersion}`;
            if (engineCommitSha) generateExportUrl += `-${engineCommitSha}`;
        }
        const config: HttpHeaders = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: (documentResponse.data as string) ?? null,
        };

        if (token) {
            config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
        }

        const httpResponse = await axios.post(generateExportUrl, undefined, config);

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
        if (token) {
            config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
        }
        const httpResponse = await fetch(endpoint, config);

        if (httpResponse?.status === 202) {
            // eslint-disable-next-line no-promise-executor-return
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return await startPollingOnEndpoint(endpoint, token);
        }
        if (httpResponse?.status === 200) {
            return (await httpResponse.json()) as GenerateAnimationTaskPollingResponse;
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
