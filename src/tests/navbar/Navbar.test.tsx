import { fireEvent, render } from '@testing-library/react';
import Navbar from '../../components/navbar/Navbar';
import { getDataTestIdForSUI } from '../../utils/dataIds';

describe('Navbar', () => {
    it('Should render 4 navbar items', () => {
        const { getByTestId } = render(
            <Navbar
                projectConfig={ProjectConfigs.empty}
                zoom={100}
                undoStackState={{
                    canRedo: false,
                    canUndo: false,
                }}
            />,
        );
        const navbarItems = Array.from(getByTestId(getDataTestIdForSUI('navbar')).children[0].children);
        expect(navbarItems).toHaveLength(4);
    });

    it('Should show download panel when download button is clicked', async () => {
        const { getByRole, getByText } = render(
            <Navbar
                projectConfig={ProjectConfigs.empty}
                zoom={100}
                undoStackState={{
                    canRedo: false,
                    canUndo: false,
                }}
            />,
        );
        const downloadButton = getByRole('button', { name: /download/i });

        fireEvent.click(downloadButton);
        expect(getByText(/output type/i)).toBeInTheDocument();

        const dropdown = getByText(/jpg/i);
        expect(dropdown).toBeInTheDocument();

        fireEvent.click(dropdown);
    });
});

class ProjectConfigs {
    static empty = {
        projectId: '00000000-0000-0000-0000-000000000000',
        projectName: '',
        onProjectInfoRequested: async () => {
            return { name: '', id: '', template: { id: '00000000-0000-0000-0000-000000000000' } };
        },
        onProjectTemplateRequested: async () => {
            return '';
        },
        onProjectLoaded: () => {
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
        onUserInterfaceBack: () => {
            // ignored
        },
        onLogInfoRequested: () => {
            // ignored
        },
        onProjectGetDownloadLink: async () => {
            return { status: 0, error: '', success: false, parsedData: '', data: '' };
        },
    };
}
