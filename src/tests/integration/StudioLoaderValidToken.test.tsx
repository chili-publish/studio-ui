import { connectorSourceUrl, onVariableListChangedCallback } from '@tests/shared.util/sdk.mock';
import axios from 'axios';
import { act, render, screen, waitFor } from '@testing-library/react';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import { mockVariables } from '@mocks/mockVariables';

import { ImageVariable } from '@chili-publish/studio-sdk';
import StudioUI from '../../main';

const environmentBaseURL = 'environmentBaseURL';
const projectID = 'projectId';
const projectName = 'projectName';
const projectDownloadUrl = `${environmentBaseURL}/projects/${projectID}/document`;
const projectInfoUrl = `${environmentBaseURL}/projects/${projectID}`;
const token = 'auth-token';

jest.mock('axios');

describe('StudioLoader integration - valid auth token', () => {
    beforeAll(() => {
        (axios.get as jest.Mock).mockImplementation((url) => {
            if (url === `${environmentBaseURL}/user-interfaces`)
                return Promise.resolve({ status: 200, data: { data: [mockUserInterface] } });
            if (url === `${environmentBaseURL}/output/settings`)
                return Promise.resolve({ status: 200, data: { data: [mockOutputSetting] } });
            if (url === projectDownloadUrl) return Promise.resolve({ data: {} });
            if (url === projectInfoUrl) return Promise.resolve({ data: mockProject });
            if (url === connectorSourceUrl) return Promise.resolve({ data: {} });
        });
    });

    it('Should correctly get media details for the image variable when token is valid', async () => {
        const imgVariable: ImageVariable = mockVariables[0];
        const config = {
            selector: 'sui-root',
            projectDownloadUrl,
            projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
            projectId: projectID,
            graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
            authToken: token,
            projectName,
            refreshTokenAction: () => Promise.resolve(''),
        };

        render(<div id="sui-root" />);
        act(() => {
            StudioUI.studioLoaderConfig(config);
        });

        await waitFor(() => {
            expect(screen.getByText(projectName)).toBeInTheDocument();
        });
        expect(axios.get).toHaveBeenCalledWith(projectInfoUrl, { headers: { Authorization: `Bearer ${token}` } });

        act(() => {
            onVariableListChangedCallback?.(mockVariables);
        });
        await waitFor(() => {
            expect(screen.getByText('Variable1')).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(window.SDK.mediaConnector.query).toHaveBeenCalledWith(
                imgVariable.value?.connectorId,
                { filter: [imgVariable.value?.assetId] },
                {},
            );
        });
    });
});
