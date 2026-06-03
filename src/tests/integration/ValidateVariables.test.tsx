import '@tests/mocks/sdk.mock';
import { ShortTextVariable } from '@chili-publish/studio-sdk';
import { mockUserInterface, mockApiUserInterface } from '@mocks/mockUserinterface';
import { mockOutputSetting, mockOutputSetting2 } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import { act, render, screen, waitFor } from '@testing-library/react';
import { variables } from '@tests/mocks/mockVariables';
import StudioUI from '../../main';

// Mock ProjectDataClient
jest.mock('../../services/ProjectDataClient', () => ({
    ProjectDataClient: jest.fn().mockImplementation(() => ({
        fetchFromUrl: jest.fn().mockResolvedValue('{"test": "document"}'),
        saveToUrl: jest.fn().mockResolvedValue(undefined),
    })),
}));

// Mock EnvironmentApiService
jest.mock('../../services/EnvironmentApiService', () => ({
    EnvironmentApiService: {
        create: jest.fn().mockImplementation(() => ({
            getProjectById: jest.fn().mockResolvedValue(mockProject),
            getProjectDocument: jest.fn().mockResolvedValue({ data: '{"test": "document"}' }),
            saveProjectDocument: jest.fn().mockResolvedValue({ success: true }),
            getAllUserInterfaces: jest.fn().mockResolvedValue({ data: [mockApiUserInterface] }),
            getUserInterfaceById: jest.fn().mockResolvedValue(mockApiUserInterface),
            getOutputSettings: jest.fn().mockResolvedValue({ data: [mockOutputSetting, mockOutputSetting2] }),
            getAllConnectors: jest.fn().mockResolvedValue({ data: [] }),
            getConnectorById: jest.fn().mockResolvedValue({}),
            getConnectorByIdAs: jest.fn().mockResolvedValue({}),
            getOutputSettingsById: jest.fn().mockResolvedValue({}),
            getTaskStatus: jest.fn().mockResolvedValue({}),
            generateOutput: jest.fn().mockResolvedValue({}),
        })),
    },
}));

const environmentBaseURL = 'https://test-api.test.com/grafx/api/v1/environment/test-api';
const projectID = 'projectId';
const token = 'auth-token';

const config = {
    selector: 'sui-root',
    projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
    projectId: projectID,
    graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
    authToken: token,
    projectName: '',
    userInterfaceID: mockUserInterface.id,
    onFetchUserInterfaceDetails: () => Promise.resolve(mockUserInterface),
};

const textVariable = variables.find((item) => item.id === 'shortVariable 1') as ShortTextVariable;

const pushVariables = async (vars: unknown[]) => {
    await act(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (window.StudioUISDK as any).subscriber.onVariableListChanged(JSON.stringify(vars));
    });
};

describe('StudioUI.validateVariables() public API', () => {
    it('returns the failing required-but-empty variable and flags it red in the UI', async () => {
        render(<div id="sui-root" />);
        let instance: StudioUI | null = null;
        act(() => {
            instance = StudioUI.studioUILoaderConfig(config);
        });

        await pushVariables([{ ...textVariable, value: '', isRequired: true, isVisible: true }]);

        await waitFor(() => {
            expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
        });

        let result: Array<{ id: string }> = [];
        await act(async () => {
            result = await instance!.validateVariables();
        });

        expect(result).toEqual([{ id: textVariable.id }]);
        await waitFor(() => {
            expect(screen.getByText('This field is required')).toBeInTheDocument();
        });
    });

    it('is idempotent: re-running after the value is filled returns [] and un-flags the field', async () => {
        render(<div id="sui-root" />);
        let instance: StudioUI | null = null;
        act(() => {
            instance = StudioUI.studioUILoaderConfig(config);
        });

        await pushVariables([{ ...textVariable, value: '', isRequired: true, isVisible: true }]);

        await act(async () => {
            await instance!.validateVariables();
        });
        await waitFor(() => {
            expect(screen.getByText('This field is required')).toBeInTheDocument();
        });

        // value is filled in, then we re-validate
        await pushVariables([{ ...textVariable, value: 'now filled', isRequired: true, isVisible: true }]);

        let result: Array<{ id: string }> = [{ id: 'placeholder' }];
        await act(async () => {
            result = await instance!.validateVariables();
        });

        expect(result).toEqual([]);
        await waitFor(() => {
            expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
        });
    });

    it('ignores hidden variables (isVisible === false)', async () => {
        render(<div id="sui-root" />);
        let instance: StudioUI | null = null;
        act(() => {
            instance = StudioUI.studioUILoaderConfig(config);
        });

        await pushVariables([{ ...textVariable, value: '', isRequired: true, isVisible: false }]);

        let result: Array<{ id: string }> = [{ id: 'placeholder' }];
        await act(async () => {
            result = await instance!.validateVariables();
        });

        expect(result).toEqual([]);
    });

    it('is a safe no-op (returns []) when called after destroy()', async () => {
        render(<div id="sui-root" />);
        let instance: StudioUI | null = null;
        act(() => {
            instance = StudioUI.studioUILoaderConfig(config);
        });

        await pushVariables([{ ...textVariable, value: '', isRequired: true, isVisible: true }]);

        act(() => {
            instance!.destroy();
        });

        const result = await instance!.validateVariables();
        expect(result).toEqual([]);
    });

    it('returns [] when called before any variables exist in the store', async () => {
        render(<div id="sui-root" />);
        let instance: StudioUI | null = null;
        act(() => {
            instance = StudioUI.studioUILoaderConfig(config);
        });

        const result = await instance!.validateVariables();
        expect(result).toEqual([]);
    });
});
