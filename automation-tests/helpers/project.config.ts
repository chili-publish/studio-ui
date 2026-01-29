import { IStudioUILoaderConfig } from 'src/types/types';
import { projectInfo } from './projectInfo';

export const getProjectConfig = (extendedConfig: Partial<IStudioUILoaderConfig>) => {
    const envName = projectInfo.envName;
    const projectId = projectInfo.projectId;
    const baseUrl = `https://${envName}.cpstaging.online/grafx/api/v1/environment/${envName}`;
    // Base configuration shared between regular and sandbox modes
    const baseConfig = {
        selector: 'studio-ui-container',
        graFxStudioEnvironmentApiBaseUrl: `${baseUrl}`,
        editorLink: `https://stgrafxstudiodevpublic.blob.core.windows.net/editor/main-latest/web`,
        featureFlags: {},
        projectName: 'Test project name',
    };

    const projectConfig = {
        // Div id to inject studio-ui in
        selector: baseConfig.selector,
        // downloadUrl used to fetch the document
        projectDownloadUrl: `${baseUrl}/projects/${projectId}/document`,
        // project Id to enable autosave
        projectId,
        /* environment base URL ex: https://cp-abc-123.chili-publish.online/grafx/api/v1/cp-abc-123 */
        graFxStudioEnvironmentApiBaseUrl: baseUrl,
        /* projectName: string, name of the project. Shown in the UI (does not have to be match the real name) */
        projectName: baseConfig.projectName,
        userInterfaceID: undefined,
        ...extendedConfig,
    };

    return projectConfig;
};
