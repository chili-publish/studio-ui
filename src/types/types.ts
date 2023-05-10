import { AxiosError } from 'axios';

export interface ProjectConfig {
    templateDownloadUrl: string;
    templateUploadUrl: string;
    templateId: string;
    graFxStudioEnvironmentApiBaseUrl: string;
    authToken?: string;
    refreshTokenAction: () => Promise<string | AxiosError>;
    projectName: string;
    onBack: () => void;
}
