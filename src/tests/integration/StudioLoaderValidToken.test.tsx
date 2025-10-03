import { onVariableListChangedCallback } from '@tests/mocks/sdk.mock';
import { mockVariables } from '@mocks/mockVariables';
import { act, render, screen, waitFor } from '@testing-library/react';
import { ImageVariable } from '@chili-publish/studio-sdk';

import StudioUI from '../../main';

const environmentBaseURL = 'environmentBaseURL';
const projectID = 'projectId';
const projectName = 'projectName';
const token = 'auth-token';

describe('StudioLoader integration - valid auth token', () => {
    it('Should correctly get media details for the image variable when token is valid', async () => {
        const imgVariable: ImageVariable = mockVariables[0] as ImageVariable;
        const config = {
            selector: 'sui-root',
            projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
            projectId: projectID,
            graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
            authToken: token,
            projectName,
            refreshTokenAction: () => Promise.resolve(''),
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
