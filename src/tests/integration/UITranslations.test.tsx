import { act, render, screen, waitFor } from '@testing-library/react';
import StudioUI from '../../main';

const mockUITranslations = {
    formBuilder: {
        variables: { header: 'Vars', helpText: 'Vars help' },
        datasource: { header: 'DS', helpText: 'DS help' },
        layouts: { header: 'Layouts', helpText: 'Layouts help' },
    },
    toolBar: {
        downloadButton: { label: 'Download' },
    },
};

const config = {
    selector: 'sui-root',
    projectDownloadUrl: 'http://abc.com/projects/projectId/document',
    projectUploadUrl: 'http://abc.com/projects/projectId',
    projectId: 'projectId',
    graFxStudioEnvironmentApiBaseUrl: 'http://abc.com',
    authToken: 'token',
    projectName: '',
    uiTranslations: mockUITranslations,
    // Add any other required config/mocks here
};

describe('UITranslations Integration', () => {
    beforeEach(() => {
        render(<div id="sui-root" />);
    });

    it('should render translated UI labels', async () => {
        await act(() => {
            StudioUI.studioUILoaderConfig(config);
        });
        // Simulate whatever is needed to show the UI
        await waitFor(() => {
            expect(screen.getByText('Vars')).toBeInTheDocument();
            expect(screen.getByText('Vars help')).toBeInTheDocument();
            expect(screen.getByText('DS')).toBeInTheDocument();
            expect(screen.getByText('Layouts')).toBeInTheDocument();
            expect(screen.getByText('Download')).toBeInTheDocument();
        });
    });
});
