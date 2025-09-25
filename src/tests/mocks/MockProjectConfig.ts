import { defaultOutputSettings, defaultPlatformUiOptions, ProjectConfig } from 'src/types/types';
import { EnvironmentApiService } from 'src/services/EnvironmentApiService';

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
        onBack: () => {
            // ignored
        },
        onLogInfoRequested: () => {
            // ignored
        },
        onGenerateOutput: async () => {
            return { extensionType: 'pdf', outputData: new Blob() };
        },
        onFetchOutputSettings: async () => {
            return null;
        },
        onFetchUserInterfaces: async () => {
            return { data: [], pageSize: 0 };
        },
        environmentApiService: {
            getProjectById: jest.fn().mockResolvedValue({
                id: '00000000-0000-0000-0000-000000000000',
                name: 'mockProjectName',
                template: { id: 'dddddd' },
            }),
            getProjectDocument: jest.fn().mockResolvedValue({ data: { mock: 'data' } }),
            saveProjectDocument: jest.fn().mockResolvedValue({ success: true }),
        } as unknown as EnvironmentApiService,
    };
}
