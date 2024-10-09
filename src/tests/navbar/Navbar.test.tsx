import { fireEvent, render, screen } from '@testing-library/react';
import { UiThemeProvider, getDataTestId } from '@chili-publish/grafx-shared-components';
import { DownloadFormats } from '@chili-publish/studio-sdk';
import Navbar from '../../components/navbar/Navbar';
import { getDataTestIdForSUI } from '../../utils/dataIds';
import { ProjectConfig, defaultOutputSettings, defaultPlatformUiOptions } from '../../types/types';
import * as UiConfigContext from '../../contexts/UiConfigContext';

describe('Navbar', () => {
    it('Should render 4 navbar items', () => {
        const { getByTestId } = render(
            <UiConfigContext.UiConfigContextProvider projectConfig={ProjectConfigs.empty} layoutIntent={null}>
                <UiThemeProvider theme="platform">
                    <Navbar
                        projectConfig={ProjectConfigs.empty}
                        zoom={100}
                        undoStackState={{
                            canRedo: false,
                            canUndo: false,
                        }}
                    />
                </UiThemeProvider>
            </UiConfigContext.UiConfigContextProvider>,
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
            <UiConfigContext.UiConfigContextProvider projectConfig={config} layoutIntent={null}>
                <UiThemeProvider theme="platform">
                    <Navbar
                        projectConfig={config}
                        zoom={100}
                        undoStackState={{
                            canRedo: false,
                            canUndo: false,
                        }}
                    />
                </UiThemeProvider>
            </UiConfigContext.UiConfigContextProvider>,
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
            <UiConfigContext.UiConfigContextProvider projectConfig={config} layoutIntent={null}>
                <UiThemeProvider theme="platform">
                    <Navbar
                        projectConfig={config}
                        zoom={100}
                        undoStackState={{
                            canRedo: false,
                            canUndo: false,
                        }}
                    />
                </UiThemeProvider>
            </UiConfigContext.UiConfigContextProvider>,
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
            <UiConfigContext.UiConfigContextProvider projectConfig={ProjectConfigs.empty} layoutIntent={null}>
                <UiThemeProvider theme="platform">
                    <Navbar
                        projectConfig={ProjectConfigs.empty}
                        zoom={100}
                        undoStackState={{
                            canRedo: false,
                            canUndo: false,
                        }}
                    />
                </UiThemeProvider>
            </UiConfigContext.UiConfigContextProvider>,
        );
        const downloadButton = getByRole('button', { name: /download/i });

        fireEvent.click(downloadButton);
        expect(getByText(/output/i)).toBeInTheDocument();

        const dropdown = getByText(/jpg/i);
        expect(dropdown).toBeInTheDocument();

        fireEvent.click(dropdown);
    });

    it('Shows user interface output settings options when available', async () => {
        const { getByRole, getByText } = render(
            <UiConfigContext.UiConfigContextProvider projectConfig={ProjectConfigs.empty} layoutIntent={null}>
                <UiThemeProvider theme="platform">
                    <Navbar
                        projectConfig={ProjectConfigs.empty}
                        zoom={100}
                        undoStackState={{
                            canRedo: false,
                            canUndo: false,
                        }}
                    />
                </UiThemeProvider>
            </UiConfigContext.UiConfigContextProvider>,
        );
        jest.spyOn(UiConfigContext, 'useUiConfigContext').mockImplementation(() => {
            return {
                ...UiConfigContext.UiConfigContextDefaultValues,
                outputSettings: { mp4: true, gif: false },
                userInterfaceOutputSettings: [
                    {
                        name: 'user interface MP4',
                        id: '1',
                        description: 'some decs',
                        type: DownloadFormats.MP4,
                        layoutIntents: ['digitalAnimated'],
                    },
                    {
                        name: 'user interface GIF',
                        id: '2',
                        description: 'some decs',
                        type: DownloadFormats.MP4,
                        layoutIntents: ['digitalAnimated'],
                    },
                ],
            };
        });
        const downloadButton = getByRole('button', { name: /download/i });

        fireEvent.click(downloadButton);
        expect(getByText(/output/i)).toBeInTheDocument();

        const dropdown = getByText(/user interface MP4/i);
        expect(dropdown).toBeInTheDocument();
    });
});

class ProjectConfigs {
    static empty: ProjectConfig = {
        projectId: '00000000-0000-0000-0000-000000000000',
        projectName: '',
        uiOptions: defaultPlatformUiOptions,
        outputSettings: defaultOutputSettings,
        graFxStudioEnvironmentApiBaseUrl: '',
        uiTheme: 'light',
        onProjectInfoRequested: async () => {
            return { name: '', id: '', template: { id: '00000000-0000-0000-0000-000000000000' } };
        },
        onProjectDocumentRequested: async () => {
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
