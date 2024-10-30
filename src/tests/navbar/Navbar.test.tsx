import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { UiThemeProvider, getDataTestId } from '@chili-publish/grafx-shared-components';
import { DownloadFormats, LayoutIntent } from '@chili-publish/studio-sdk';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import Navbar from '../../components/navbar/Navbar';
import { getDataTestIdForSUI } from '../../utils/dataIds';
import { ProjectConfig, defaultOutputSettings, defaultPlatformUiOptions } from '../../types/types';
import * as UiConfigContext from '../../contexts/UiConfigContext';
import { APP_WRAPPER_ID } from '../../utils/constants';

describe('Navbar', () => {
    let prjConfig: ProjectConfig;
    beforeEach(() => {
        prjConfig = {
            ...ProjectConfigs.empty,
            onFetchOutputSettings: () =>
                Promise.resolve({
                    userInterface: { id: '1', name: 'name' },
                    outputSettings: [
                        { ...mockOutputSetting, layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'] },
                    ],
                }),
        };
    });
    it('Should render 4 navbar items', async () => {
        const { getByTestId } = render(
            <UiConfigContext.UiConfigContextProvider
                projectConfig={prjConfig}
                layoutIntent={LayoutIntent.digitalAnimated}
            >
                <div id={APP_WRAPPER_ID}>
                    <UiThemeProvider theme="platform">
                        <Navbar
                            projectConfig={prjConfig}
                            zoom={100}
                            undoStackState={{
                                canRedo: false,
                                canUndo: false,
                            }}
                        />
                    </UiThemeProvider>
                </div>
            </UiConfigContext.UiConfigContextProvider>,
        );
        await waitFor(() => {
            const navbarItems = Array.from(getByTestId(getDataTestIdForSUI('navbar')).children[0].children);
            expect(navbarItems).toHaveLength(4);
        });
    });

    it('Should hide download button when configuration is provided', async () => {
        const config = {
            ...prjConfig,
            uiOptions: {
                widgets: {
                    backButton: {
                        visible: true,
                    },
                },
            },
        };
        const { getByTestId } = render(
            <UiConfigContext.UiConfigContextProvider projectConfig={config} layoutIntent={LayoutIntent.digitalAnimated}>
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

        await waitFor(() => {
            const navbarItems = Array.from(getByTestId(getDataTestIdForSUI('navbar')).children[0].children);
            expect(navbarItems).toHaveLength(3);
        });

        const downloadButton = screen.queryByRole('button', { name: /download/i });
        const backButton = screen.getByTestId(getDataTestId('back-btn'));

        expect(downloadButton).not.toBeInTheDocument();
        expect(backButton).toBeInTheDocument();
    });

    it('Should hide back button when configuration is provided', async () => {
        const config = {
            ...prjConfig,
            uiOptions: {
                widgets: {
                    downloadButton: { visible: true },
                    backButton: { visible: false },
                },
            },
        };
        const { getByTestId } = render(
            <UiConfigContext.UiConfigContextProvider projectConfig={config} layoutIntent={LayoutIntent.digitalAnimated}>
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
        const backButton = screen.queryByTestId(getDataTestId('back-btn'));
        expect(backButton).not.toBeInTheDocument();

        await waitFor(() => {
            const downloadButton = screen.getByRole('button', { name: /download/i });
            expect(downloadButton).toBeInTheDocument();
        });
        await waitFor(() => {
            const navbarItems = Array.from(getByTestId(getDataTestIdForSUI('navbar')).children[0].children);
            expect(navbarItems).toHaveLength(3);
        });
    });

    it('Should show download panel when download button is clicked', async () => {
        const { getByRole, getByText } = render(
            <UiConfigContext.UiConfigContextProvider
                projectConfig={prjConfig}
                layoutIntent={LayoutIntent.digitalAnimated}
            >
                <div id={APP_WRAPPER_ID}>
                    <UiThemeProvider theme="platform">
                        <Navbar
                            projectConfig={prjConfig}
                            zoom={100}
                            undoStackState={{
                                canRedo: false,
                                canUndo: false,
                            }}
                        />
                    </UiThemeProvider>
                </div>
            </UiConfigContext.UiConfigContextProvider>,
        );

        await waitFor(() => {
            const downloadButton = screen.getByRole('button', { name: /download/i });
            expect(downloadButton).toBeInTheDocument();
        });

        const downloadButton = getByRole('button', { name: /download/i });

        fireEvent.click(downloadButton);
        expect(getByText(/output/i)).toBeInTheDocument();

        const dropdown = getByText(/gif/i);
        expect(dropdown).toBeInTheDocument();

        fireEvent.click(dropdown);
    });

    it('Shows user interface output settings options when available', async () => {
        prjConfig = {
            ...ProjectConfigs.empty,
            outputSettings: { mp4: true, gif: false },
            onFetchOutputSettings: () =>
                Promise.resolve({
                    userInterface: { id: '1', name: 'name' },
                    outputSettings: [
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
                }),
        };
        const { getByRole, getByText } = render(
            <UiConfigContext.UiConfigContextProvider
                projectConfig={prjConfig}
                layoutIntent={LayoutIntent.digitalAnimated}
            >
                <div id={APP_WRAPPER_ID}>
                    <UiThemeProvider theme="platform">
                        <Navbar
                            projectConfig={prjConfig}
                            zoom={100}
                            undoStackState={{
                                canRedo: false,
                                canUndo: false,
                            }}
                        />
                    </UiThemeProvider>
                </div>
            </UiConfigContext.UiConfigContextProvider>,
        );

        await waitFor(() => {
            const downloadButton = screen.getByRole('button', { name: /download/i });
            expect(downloadButton).toBeInTheDocument();
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
        sandboxMode: false,
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
