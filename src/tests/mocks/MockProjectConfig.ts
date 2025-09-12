import { defaultOutputSettings, defaultPlatformUiOptions, ProjectConfig } from 'src/types/types';
import {
    ConnectorsApi,
    ProjectsApi,
    UserInterfacesApi,
    SettingsApi,
    OutputApi,
} from '@chili-publish/environment-client-api';

export class ProjectConfigs {
    static empty: ProjectConfig = {
        projectId: '00000000-0000-0000-0000-000000000000',
        projectName: '',
        uiOptions: { ...defaultPlatformUiOptions, uiTheme: 'light', uiDirection: 'ltr' },
        outputSettings: defaultOutputSettings,
        graFxStudioEnvironmentApiBaseUrl: '',
        sandboxMode: false,
        onProjectInfoRequested: async () => {
            return { name: '', id: '', template: { id: '00000000-0000-0000-0000-000000000000' } };
        },
        onProjectDocumentRequested: async () => {
            return '';
        },
        onEngineInitialized: () => {
            // ignored
        },
        onProjectSave: async () => {
            return {
                name: '',
                id: '00000000-0000-0000-0000-000000000000',
                template: { id: '00000000-0000-0000-0000-000000000000' },
            };
        },
        onAuthenticationRequested: () => {
            return '';
        },
        onAuthenticationExpired: async () => {
            return '';
        },
        onBack: () => {
            // ignored
        },
        onLogInfoRequested: () => {
            // ignored
        },
        onProjectGetDownloadLink: async () => {
            return { status: 0, error: '', success: false, parsedData: '', data: '' };
        },
        environmentClientApis: {
            connectorsApi: {} as ConnectorsApi,
            projectsApi: {
                apiV1EnvironmentEnvironmentProjectsProjectIdGet: jest.fn().mockResolvedValue({
                    id: '00000000-0000-0000-0000-000000000000',
                    name: 'mockProjectName',
                    template: { id: 'dddddd' },
                }),
                apiV1EnvironmentEnvironmentProjectsProjectIdDocumentGet: jest
                    .fn()
                    .mockResolvedValue({ data: { mock: 'data' } }),
                apiV1EnvironmentEnvironmentProjectsProjectIdDocumentPut: jest.fn().mockResolvedValue({ success: true }),
            } as unknown as ProjectsApi,
            userInterfacesApi: {} as UserInterfacesApi,
            settingsApi: {} as SettingsApi,
            outputApi: {} as OutputApi,
            environment: 'test-environment',
        },
    };
}
