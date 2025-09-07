import { onVariableListChangedCallback } from '@tests/mocks/sdk.mock';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { mockVariables } from '@mocks/mockVariables';
import { act, render, screen, waitFor } from '@testing-library/react';
import { ImageVariable } from '@chili-publish/studio-sdk';
import { createMockEnvironmentClientApis } from '../mocks/environmentClientApi';

import StudioUI from '../../main';

// Mock environment client API
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
        apiV1EnvironmentEnvironmentUserInterfacesGet: jest.fn().mockResolvedValue({ data: [mockUserInterface] }),
        apiV1EnvironmentEnvironmentUserInterfacesUserInterfaceIdGet: jest.fn().mockResolvedValue(mockUserInterface),
    })),
    SettingsApi: jest.fn().mockImplementation(() => ({})),
    OutputApi: jest.fn().mockImplementation(() => ({
        apiV1EnvironmentEnvironmentOutputSettingsGet: jest.fn().mockResolvedValue({ data: [mockOutputSetting] }),
    })),
    Configuration: jest.fn().mockImplementation(() => ({})),
}));

// Mock environment client APIs for testing
const mockEnvironmentClientApis = createMockEnvironmentClientApis();

const environmentBaseURL = 'environmentBaseURL';
const projectID = 'projectId';
const projectName = 'projectName';
const token = 'auth-token';

// Remove axios mock to force environment client API usage

describe('StudioLoader integration - valid auth token', () => {
    it('Should correctly get media details for the image variable when token is valid', async () => {
        const imgVariable: ImageVariable = mockVariables[0] as ImageVariable;
        const config = {
            selector: 'sui-root',
            // projectDownloadUrl, // Commented out to use environment client API
            projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
            projectId: projectID,
            graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
            authToken: token,
            projectName,
            refreshTokenAction: () => Promise.resolve(''),
            environmentClientApis: mockEnvironmentClientApis,
        };

        render(<div id="sui-root" />);
        act(() => {
            StudioUI.studioUILoaderConfig(config);
        });

        await waitFor(() => {
            expect(screen.getByText(projectName)).toBeInTheDocument();
        });

        act(() => {
            onVariableListChangedCallback?.(mockVariables);
        });
        await waitFor(() => {
            expect(screen.getByText('Variable1 Label')).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(window.StudioUISDK.mediaConnector.query).toHaveBeenCalledWith(imgVariable.value?.connectorId, {
                filter: ['f7951442-822e-4a3e-9a9c-2fe56bae2241'],
                pageSize: 1,
            });
        });
    });
});
