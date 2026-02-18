/* eslint-disable @typescript-eslint/no-explicit-any, no-restricted-syntax */
import { act, waitFor } from '@testing-library/react';
import { createRoot, Root } from 'react-dom/client';
import StudioUI from 'src/main';
import { ProjectConfig } from 'src/types/types';

const environmentBaseURL = 'https://test-api.test.com/grafx/api/v1/environment/test-api';
const projectID = 'projectId';
const projectName = 'projectName';
const projectDownloadUrl = `${environmentBaseURL}/projects/${projectID}/document`;
const token = 'auth-token';

// Mock react-dom/client
jest.mock('react-dom/client', () => ({
    createRoot: jest.fn(),
    Root: jest.fn(),
}));

let capturedAppProps: { projectConfig: ProjectConfig } | null = null;
// Helper function to extract App props from React element tree
const extractAppProps = (element: any): any => {
    if (!element) return null;

    // Check if this is the App component (mocked as MockApp)
    const elementType = element.type;
    if (elementType && (elementType.name === 'MockApp' || elementType.name === 'App')) {
        return element.props;
    }

    // Recursively search children
    if (element.props && element.props.children) {
        const children = Array.isArray(element.props.children) ? element.props.children : [element.props.children];
        for (const child of children) {
            const props = extractAppProps(child);
            if (props) return props;
        }
    }
    return null;
};

describe('StudioLoader integration - onBack', () => {
    let mockRoot: jest.Mocked<Root>;
    let mockContainer: HTMLElement;
    let mockCreateRoot: jest.MockedFunction<typeof createRoot>;

    beforeEach(() => {
        mockRoot = {
            render: jest.fn((element: any) => {
                // Extract App props from the React element tree
                const props = extractAppProps(element);
                if (props) {
                    capturedAppProps = props;
                }
            }),
            unmount: jest.fn(),
        } as any;

        mockContainer = document.createElement('div');
        mockContainer.id = 'test-selector';

        mockCreateRoot = createRoot as jest.MockedFunction<typeof createRoot>;
        mockCreateRoot.mockReturnValue(mockRoot);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should create instance when there is no projectId provided in the config (projectId is optional)', async () => {
        let instance;
        const onBack = jest.fn();
        act(() => {
            instance = StudioUI.studioUILoaderConfig({
                selector: 'sui-root',
                projectDownloadUrl, // Keep this to test ProjectDataClient path
                projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
                graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
                authToken: token,
                projectName,
                refreshTokenAction: () => Promise.resolve(''),
                uiOptions: {
                    widgets: {
                        backButton: {
                            visible: true,
                            event: onBack,
                        },
                    },
                },
            });
        });

        expect(instance).not.toBeNull();
        const destroySpy = jest.spyOn(instance! as StudioUI, 'destroy');

        act(() => {
            capturedAppProps?.projectConfig.onBack();
        });

        await waitFor(() => {
            expect(onBack).toHaveBeenCalled();
            expect(destroySpy).toHaveBeenCalled();
        });
    });
});
