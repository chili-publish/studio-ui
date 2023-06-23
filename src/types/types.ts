import { AxiosError } from 'axios';

export interface ProjectConfig {
    projectDownloadUrl: string;
    projectUploadUrl: string;
    projectId: string;
    graFxStudioEnvironmentApiBaseUrl: string;
    authToken?: string;
    refreshTokenAction: () => Promise<string | AxiosError>;
    projectName: string;
    onBack: () => void;
}
