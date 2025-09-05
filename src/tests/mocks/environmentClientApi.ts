import {
    ConnectorsApi,
    ProjectsApi,
    UserInterfacesApi,
    SettingsApi,
    OutputApi,
} from '@chili-publish/environment-client-api';
import { mockOutputSetting, mockOutputSetting2 } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import { mockApiUserInterface } from '@mocks/mockUserinterface';

/**
 * Creates mock environment client API instances for testing
 */
export const createMockEnvironmentClientApis = () => ({
    connectorsApi: {} as ConnectorsApi,
    projectsApi: {
        apiV1EnvironmentEnvironmentProjectsProjectIdGet: jest.fn().mockResolvedValue(mockProject),
        apiV1EnvironmentEnvironmentProjectsProjectIdDocumentGet: jest
            .fn()
            .mockResolvedValue({ data: '{"test": "document"}' }),
        apiV1EnvironmentEnvironmentProjectsProjectIdDocumentPut: jest.fn().mockResolvedValue({ success: true }),
    } as unknown as ProjectsApi,
    userInterfacesApi: {
        apiV1EnvironmentEnvironmentUserInterfacesGet: jest.fn().mockResolvedValue({ data: [mockApiUserInterface] }),
        apiV1EnvironmentEnvironmentUserInterfacesUserInterfaceIdGet: jest.fn().mockResolvedValue(mockApiUserInterface),
    } as unknown as UserInterfacesApi,
    settingsApi: {} as SettingsApi,
    outputApi: {
        apiV1EnvironmentEnvironmentOutputSettingsGet: jest
            .fn()
            .mockResolvedValue({ data: [mockOutputSetting, mockOutputSetting2] }),
    } as unknown as OutputApi,
    environment: 'test-environment',
});

/**
 * Jest mock for the entire @chili-publish/environment-client-api module
 */
export const mockEnvironmentClientApiModule = () => {
    jest.mock('@chili-publish/environment-client-api', () => ({
        ConnectorsApi: jest.fn().mockImplementation(() => ({})),
        ProjectsApi: jest.fn().mockImplementation(() => ({
            apiV1EnvironmentEnvironmentProjectsProjectIdGet: jest.fn().mockResolvedValue(mockProject),
            apiV1EnvironmentEnvironmentProjectsProjectIdDocumentGet: jest
                .fn()
                .mockResolvedValue({ data: '{"test": "document"}' }),
            apiV1EnvironmentEnvironmentProjectsProjectIdDocumentPut: jest.fn().mockResolvedValue({ success: true }),
        })),
        UserInterfacesApi: jest.fn().mockImplementation(() => ({
            apiV1EnvironmentEnvironmentUserInterfacesGet: jest.fn().mockResolvedValue({ data: [mockApiUserInterface] }),
            apiV1EnvironmentEnvironmentUserInterfacesUserInterfaceIdGet: jest
                .fn()
                .mockResolvedValue(mockApiUserInterface),
        })),
        SettingsApi: jest.fn().mockImplementation(() => ({})),
        OutputApi: jest.fn().mockImplementation(() => ({
            apiV1EnvironmentEnvironmentOutputSettingsGet: jest
                .fn()
                .mockResolvedValue({ data: [mockOutputSetting, mockOutputSetting2] }),
        })),
        Configuration: jest.fn().mockImplementation(() => ({})),
    }));
};
