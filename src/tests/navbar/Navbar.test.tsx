import { fireEvent, render, screen } from '@testing-library/react';
import Navbar from '../../components/navbar/Navbar';
import { getDataTestIdForSUI } from '../../utils/dataIds';
import { defaultOutputSettings, defaultPlatformUiOptions } from '../../types/types';
import { UiConfigContextProvider } from '../../contexts/UiConfigContext';
import { getDataTestId } from '@chili-publish/grafx-shared-components';

describe('Navbar', () => {
    it('Should render 4 navbar items', () => {
        const { getByTestId } = render(
            <UiConfigContextProvider projectConfig={ProjectConfigs.empty}>
                <Navbar
                    projectConfig={ProjectConfigs.empty}
                    zoom={100}
                    undoStackState={{
                        canRedo: false,
                        canUndo: false,
                    }}
                />
            </UiConfigContextProvider>,
        );
        const navbarItems = Array.from(getByTestId(getDataTestIdForSUI('navbar')).children[0].children);
        expect(navbarItems).toHaveLength(4);
    });

    it('Should hide download button when configuration is provided', () => {
        const config = {
            ...ProjectConfigs.empty,
            uiOptions: {
                widgets: {
                    backButton: {
                        visible: true,
                    },
                },
            },
        };
        const { getByTestId } = render(
            <UiConfigContextProvider projectConfig={config}>
                <Navbar
                    projectConfig={config}
                    zoom={100}
                    undoStackState={{
                        canRedo: false,
                        canUndo: false,
                    }}
                />
            </UiConfigContextProvider>,
        );
        const navbarItems = Array.from(getByTestId(getDataTestIdForSUI('navbar')).children[0].children);
        const downloadButton = screen.queryByRole('button', { name: /download/i });
        const backButton = screen.getByTestId(getDataTestId('back-btn'));

        expect(navbarItems).toHaveLength(3);
        expect(downloadButton).not.toBeInTheDocument();
        expect(backButton).toBeInTheDocument();
    });

    it('Should hide back button when configuration is provided', () => {
        const config = {
            ...ProjectConfigs.empty,
            uiOptions: {
                widgets: {
                    downloadButton: { visible: true },
                    backButton: { visible: false },
                },
            },
        };
        const { getByTestId } = render(
            <UiConfigContextProvider projectConfig={config}>
                <Navbar
                    projectConfig={config}
                    zoom={100}
                    undoStackState={{
                        canRedo: false,
                        canUndo: false,
                    }}
                />
            </UiConfigContextProvider>,
        );
        const navbarItems = Array.from(getByTestId(getDataTestIdForSUI('navbar')).children[0].children);
        const downloadButton = screen.getByRole('button', { name: /download/i });
        const backButton = screen.queryByTestId(getDataTestId('back-btn'));

        expect(navbarItems).toHaveLength(3);
        expect(downloadButton).toBeInTheDocument();
        expect(backButton).not.toBeInTheDocument();
    });

    it('Should show download panel when download button is clicked', async () => {
        const { getByRole, getByText } = render(
            <UiConfigContextProvider projectConfig={ProjectConfigs.empty}>
                <Navbar
                    projectConfig={ProjectConfigs.empty}
                    zoom={100}
                    undoStackState={{
                        canRedo: false,
                        canUndo: false,
                    }}
                />
            </UiConfigContextProvider>,
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
        uiOptions: defaultPlatformUiOptions,
        outputSettings: defaultOutputSettings,
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
