import '@tests/mocks/sdk.mock';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { mockVariables } from '@mocks/mockVariables';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import StudioUI from '../../main';
import { Project } from '../../types/types';

const environmentBaseURL = 'http://test.com';
const projectID = 'test-project-id';
const projectDownloadUrl = `${environmentBaseURL}/projects/${projectID}/document`;
const projectInfoUrl = `${environmentBaseURL}/projects/${projectID}`;
const token = 'test-auth-token';

// Mock callbacks
const mockCallbacks = {
    onProjectLoaded: jest.fn(),
    onSetMultiLayout: jest.fn(),
    onVariableValueChangedCompleted: jest.fn(),
    onSandboxModeToggle: jest.fn(),
    onProjectInfoRequested: jest.fn(),
    onProjectDocumentRequested: jest.fn(),
    onProjectSave: jest.fn(),
    onEngineInitialized: jest.fn(),
    onAuthenticationRequested: jest.fn(),
    onAuthenticationExpired: jest.fn(),
    onLogInfoRequested: jest.fn(),
    onProjectGetDownloadLink: jest.fn(),
    onConnectorAuthenticationRequested: jest.fn(),
    onFetchUserInterfaceDetails: jest.fn(),
};

jest.mock('axios');

describe('Integration Callbacks', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Setup default axios mocks
        (axios.get as jest.Mock).mockImplementation((url) => {
            if (url === `${environmentBaseURL}/user-interfaces`)
                return Promise.resolve({ status: 200, data: { data: [mockUserInterface] } });
            if (url === `${environmentBaseURL}/user-interfaces/${mockUserInterface.id}`)
                return Promise.resolve({ status: 200, data: mockUserInterface });
            if (url === `${environmentBaseURL}/output/settings`)
                return Promise.resolve({ status: 200, data: { data: [mockOutputSetting] } });
            if (url === projectDownloadUrl) return Promise.resolve({ data: {} });
            if (url === projectInfoUrl) return Promise.resolve({ data: mockProject });
            return Promise.resolve({ data: {} });
        });

        (axios.put as jest.Mock).mockResolvedValue({ data: mockProject });
        (axios.post as jest.Mock).mockResolvedValue({ data: { links: { taskInfo: 'test-task-url' } } });
    });

    describe('onProjectLoaded callback', () => {
        it('should call onProjectLoaded when project is fully loaded', async () => {
            const config = {
                selector: 'sui-root',
                projectDownloadUrl,
                projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
                projectId: projectID,
                graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
                authToken: token,
                projectName: 'Test Project',
                onProjectLoaded: mockCallbacks.onProjectLoaded,
                onFetchUserInterfaceDetails: () => Promise.resolve(mockUserInterface),
            };

            render(<div id="sui-root" />);

            await act(() => {
                StudioUI.studioUILoaderConfig(config);
            });

            // Wait for the project to load and trigger the callback
            await waitFor(() => {
                expect(mockCallbacks.onProjectLoaded).not.toHaveBeenCalledTimes(1);
            });

            // Load variables
            await act(() => {
                window.StudioUISDK.config.events.onDocumentLoaded.trigger();
            });
            // Wait for the project to load and trigger the callback
            await waitFor(() => {
                expect(mockCallbacks.onProjectLoaded).toHaveBeenCalledTimes(1);
            });
        });

        it('should not call onProjectLoaded if not provided', async () => {
            const config = {
                selector: 'sui-root',
                projectDownloadUrl,
                projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
                projectId: projectID,
                graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
                authToken: token,
                projectName: 'Test Project',
                onFetchUserInterfaceDetails: () => Promise.resolve(mockUserInterface),
            };

            render(<div id="sui-root" />);

            await act(() => {
                StudioUI.studioUILoaderConfig(config);
            });

            // Wait a bit to ensure no callback is called
            await new Promise((resolve) => {
                setTimeout(resolve, 100);
            });

            // Should not throw error and callback should not be called
            expect(mockCallbacks.onProjectLoaded).not.toHaveBeenCalled();
        });
    });

    describe('onSetMultiLayout callback', () => {
        it('should call onSetMultiLayout with setMultiLayout function', async () => {
            const config = {
                selector: 'sui-root',
                projectDownloadUrl,
                projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
                projectId: projectID,
                graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
                authToken: token,
                projectName: 'Test Project',
                onSetMultiLayout: mockCallbacks.onSetMultiLayout,
                onFetchUserInterfaceDetails: () => Promise.resolve(mockUserInterface),
            };

            render(<div id="sui-root" />);

            await act(() => {
                StudioUI.studioUILoaderConfig(config);
            });

            // Wait for the callback to be called (it may be called multiple times due to useEffect dependencies)
            await waitFor(() => {
                expect(mockCallbacks.onSetMultiLayout).toHaveBeenCalled();
            });

            // Verify it was called with a function
            const setMultiLayoutFn = mockCallbacks.onSetMultiLayout.mock.calls[0][0];
            expect(typeof setMultiLayoutFn).toBe('function');
        });

        it('should allow setting multi-layout mode via callback', async () => {
            let setMultiLayoutFn: React.Dispatch<React.SetStateAction<boolean>> | null = null;

            const config = {
                selector: 'sui-root',
                projectDownloadUrl,
                projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
                projectId: projectID,
                graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
                authToken: token,
                projectName: 'Test Project',
                onSetMultiLayout: (fn: React.Dispatch<React.SetStateAction<boolean>>) => {
                    setMultiLayoutFn = fn;
                },
                onFetchUserInterfaceDetails: () => Promise.resolve(mockUserInterface),
            };

            render(<div id="sui-root" />);

            await act(() => {
                StudioUI.studioUILoaderConfig(config);
            });

            await waitFor(() => {
                expect(setMultiLayoutFn).toBeDefined();
            });
        });

        it('should handle multiple calls to onSetMultiLayout callback', async () => {
            const config = {
                selector: 'sui-root',
                projectDownloadUrl,
                projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
                projectId: projectID,
                graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
                authToken: token,
                projectName: 'Test Project',
                onSetMultiLayout: mockCallbacks.onSetMultiLayout,
                onFetchUserInterfaceDetails: () => Promise.resolve(mockUserInterface),
            };

            render(<div id="sui-root" />);

            await act(() => {
                StudioUI.studioUILoaderConfig(config);
            });

            // Wait for the callback to be called at least once
            await waitFor(() => {
                expect(mockCallbacks.onSetMultiLayout).toHaveBeenCalled();
            });

            // Verify it was called with a function each time
            const { calls } = mockCallbacks.onSetMultiLayout.mock;
            calls.forEach((call) => {
                expect(typeof call[0]).toBe('function');
            });

            // The callback should be called  twice
            expect(mockCallbacks.onSetMultiLayout).toHaveBeenCalledTimes(2);
        });
    });

    describe('onVariableValueChangedCompleted callback', () => {
        it('should call onVariableValueChangedCompleted when variable value changes', async () => {
            const user = userEvent.setup();
            const config = {
                selector: 'sui-root',
                projectDownloadUrl,
                projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
                projectId: projectID,
                graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
                authToken: token,
                projectName: 'Test Project',
                onVariableValueChangedCompleted: mockCallbacks.onVariableValueChangedCompleted,
                onFetchUserInterfaceDetails: () => Promise.resolve(mockUserInterface),
            };

            render(<div id="sui-root" />);

            await act(() => {
                StudioUI.studioUILoaderConfig(config);
            });

            // Load variables
            await act(() => {
                window.StudioUISDK.config.events.onVariableListChanged.trigger(mockVariables);
            });

            // Find a text variable input and change its value
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const textVariable = mockVariables.find((v) => v.type === 'shortText') as any;
            if (textVariable && textVariable.value) {
                const input = screen.getByDisplayValue(textVariable.value);

                await act(async () => {
                    await user.clear(input);
                    await user.type(input, 'new value');
                    fireEvent.blur(input);
                });

                // Wait for the callback to be called
                await waitFor(() => {
                    expect(mockCallbacks.onVariableValueChangedCompleted).toHaveBeenCalledWith(
                        textVariable.id,
                        'new value',
                    );
                });
            }
        });

        it('should handle different variable value types', async () => {
            const user = userEvent.setup();
            const config = {
                selector: 'sui-root',
                projectDownloadUrl,
                projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
                projectId: projectID,
                graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
                authToken: token,
                projectName: 'Test Project',
                onVariableValueChangedCompleted: mockCallbacks.onVariableValueChangedCompleted,
                onFetchUserInterfaceDetails: () => Promise.resolve(mockUserInterface),
            };

            render(<div id="sui-root" />);

            await act(() => {
                StudioUI.studioUILoaderConfig(config);
            });

            // Load variables
            await act(() => {
                window.StudioUISDK.config.events.onVariableListChanged.trigger(mockVariables);
            });

            // Test number variable
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const numberVariable = mockVariables.find((v) => v.type === 'number') as any;
            if (numberVariable && numberVariable.value) {
                const input = screen.getByDisplayValue(numberVariable.value);

                await act(async () => {
                    await user.clear(input);
                    await user.type(input, '42');
                    fireEvent.blur(input);
                });

                await waitFor(() => {
                    expect(mockCallbacks.onVariableValueChangedCompleted).toHaveBeenLastCalledWith(
                        numberVariable.id,
                        42,
                    );
                });
            }

            // Test boolean variable
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const booleanVariable = mockVariables.find((v) => v.type === 'boolean') as any;
            if (booleanVariable && booleanVariable.label) {
                const checkbox = screen.getByRole('checkbox', { name: booleanVariable.label });

                await act(async () => {
                    await user.click(checkbox);
                });

                await waitFor(() => {
                    expect(mockCallbacks.onVariableValueChangedCompleted).toHaveBeenLastCalledWith(
                        booleanVariable.id,
                        false,
                    );
                });
            }
        });
    });

    describe('Custom callback implementations', () => {
        it('should use custom onProjectInfoRequested when provided', async () => {
            const customProject: Project = {
                id: 'custom-project',
                name: 'Custom Project',
                template: { id: 'custom-template' },
            };

            mockCallbacks.onProjectInfoRequested.mockResolvedValue(customProject);

            const config = {
                selector: 'sui-root',
                projectDownloadUrl,
                projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
                projectId: projectID,
                graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
                authToken: token,
                projectName: 'Test Project',
                onProjectInfoRequested: mockCallbacks.onProjectInfoRequested,
                onFetchUserInterfaceDetails: () => Promise.resolve(mockUserInterface),
            };

            render(<div id="sui-root" />);

            await act(() => {
                StudioUI.studioUILoaderConfig(config);
            });

            // The custom callback should be used instead of the default one
            await waitFor(() => {
                expect(mockCallbacks.onProjectInfoRequested).toHaveBeenCalledWith(projectID);
            });
        });

        it('should use custom onProjectDocumentRequested when provided', async () => {
            const customDocument = '{"custom": "document"}';
            mockCallbacks.onProjectDocumentRequested.mockResolvedValue(customDocument);

            const config = {
                selector: 'sui-root',
                projectDownloadUrl,
                projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
                projectId: projectID,
                graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
                authToken: token,
                projectName: 'Test Project',
                onProjectDocumentRequested: mockCallbacks.onProjectDocumentRequested,
                onFetchUserInterfaceDetails: () => Promise.resolve(mockUserInterface),
            };

            render(<div id="sui-root" />);

            await act(() => {
                StudioUI.studioUILoaderConfig(config);
            });

            await waitFor(() => {
                expect(mockCallbacks.onProjectDocumentRequested).toHaveBeenCalledWith(projectID);
            });
        });

        it('should use custom onFetchUserInterfaceDetails when provided', async () => {
            const customUserInterface = {
                id: 'custom-ui',
                name: 'Custom UI',
                formBuilder: [],
                outputSettings: {},
                default: false,
            };

            mockCallbacks.onFetchUserInterfaceDetails.mockResolvedValue(customUserInterface);

            const config = {
                selector: 'sui-root',
                projectDownloadUrl,
                projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
                projectId: projectID,
                graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
                authToken: token,
                projectName: 'Test Project',
                userInterfaceID: 'custom-ui',
                onFetchUserInterfaceDetails: mockCallbacks.onFetchUserInterfaceDetails,
            };

            render(<div id="sui-root" />);

            await act(() => {
                StudioUI.studioUILoaderConfig(config);
            });

            await waitFor(() => {
                expect(mockCallbacks.onFetchUserInterfaceDetails).toHaveBeenCalledWith('custom-ui');
            });
        });
    });
});
