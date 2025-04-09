import { UiThemeProvider, getDataTestId } from '@chili-publish/grafx-shared-components';
import { DownloadFormats, LayoutIntent } from '@chili-publish/studio-sdk';
import { ConnectorInstance } from '@chili-publish/studio-sdk/lib/src/next';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Navbar from '../../components/navbar/Navbar';
import AppProvider from '../../contexts/AppProvider';
import { ProjectConfig, defaultOutputSettings, defaultPlatformUiOptions } from '../../types/types';
import { APP_WRAPPER_ID } from '../../utils/constants';
import { getDataTestIdForSUI } from '../../utils/dataIds';
import { OutputSettingsContextProvider } from '../../components/navbar/OutputSettingsContext';
import { UiConfigContextProvider } from '../../contexts/UiConfigContext';

const renderComponent = (config?: ProjectConfig, layoutIntent?: LayoutIntent, dataSource?: ConnectorInstance) => {
    const prjConfig = {
        ...ProjectConfigs.empty,
        onFetchOutputSettings: () =>
            Promise.resolve({
                userInterface: { id: '1', name: 'name' },
                outputSettings: [
                    { ...mockOutputSetting, layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'] },
                ],
                outputSettingsFullList: [],
            }),
    };
    const projectConfig = config || prjConfig;

    render(
        <AppProvider dataSource={dataSource || undefined}>
            <UiConfigContextProvider projectConfig={projectConfig}>
                <OutputSettingsContextProvider
                    projectConfig={projectConfig}
                    layoutIntent={layoutIntent || LayoutIntent.digitalAnimated}
                >
                    <div id={APP_WRAPPER_ID}>
                        <UiThemeProvider theme="platform">
                            <Navbar
                                projectName=""
                                projectConfig={projectConfig}
                                zoom={100}
                                undoStackState={{
                                    canRedo: false,
                                    canUndo: false,
                                }}
                            />
                        </UiThemeProvider>
                    </div>
                </OutputSettingsContextProvider>
            </UiConfigContextProvider>
        </AppProvider>,
    );
};
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
                    outputSettingsFullList: [],
                }),
        };
    });
    it('Should render 4 navbar items', async () => {
        renderComponent();
        await waitFor(() => {
            const navbarItems = Array.from(screen.getByTestId(getDataTestIdForSUI('navbar')).children[0].children);
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

        renderComponent(config);

        await waitFor(() => {
            const navbarItems = Array.from(screen.getByTestId(getDataTestIdForSUI('navbar')).children[0].children);
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
        renderComponent(config);

        const backButton = screen.queryByTestId(getDataTestId('back-btn'));
        expect(backButton).not.toBeInTheDocument();

        await waitFor(() => {
            const downloadButton = screen.getByRole('button', { name: /download/i });
            expect(downloadButton).toBeInTheDocument();
        });
        await waitFor(() => {
            const navbarItems = Array.from(screen.getByTestId(getDataTestIdForSUI('navbar')).children[0].children);
            expect(navbarItems).toHaveLength(3);
        });
    });

    it('Should show download panel when download button is clicked', async () => {
        renderComponent();

        await waitFor(() => {
            const downloadButton = screen.getByRole('button', { name: /download/i });
            expect(downloadButton).toBeInTheDocument();
        });

        const downloadButton = screen.getByRole('button', { name: /download/i });

        fireEvent.click(downloadButton);
        expect(screen.getByText(/output/i)).toBeInTheDocument();

        const dropdown = screen.getByText(/gif/i);
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
                            dataSourceEnabled: false,
                        },
                        {
                            name: 'user interface GIF',
                            id: '2',
                            description: 'some decs',
                            type: DownloadFormats.MP4,
                            layoutIntents: ['digitalAnimated'],
                            dataSourceEnabled: false,
                        },
                    ],
                    outputSettingsFullList: [],
                }),
        };
        renderComponent(prjConfig);

        await waitFor(() => {
            const downloadButton = screen.getByRole('button', { name: /download/i });
            expect(downloadButton).toBeInTheDocument();
        });

        const downloadButton = screen.getByRole('button', { name: /download/i });

        fireEvent.click(downloadButton);
        expect(screen.getByText(/output/i)).toBeInTheDocument();

        const dropdown = screen.getByText(/user interface MP4/i);
        expect(dropdown).toBeInTheDocument();
    });

    it('Shows show correct output seetings when data source is not available', async () => {
        prjConfig = {
            ...ProjectConfigs.empty,
            outputSettings: { pdf: true, gif: false },
            onFetchOutputSettings: () =>
                Promise.resolve({
                    userInterface: { id: '1', name: 'name' },
                    outputSettings: [
                        {
                            name: 'Batch for PDF',
                            id: '1',
                            description: 'some decs',
                            type: DownloadFormats.PDF,
                            layoutIntents: ['print'],
                            dataSourceEnabled: true,
                        },
                        {
                            name: 'Single for PDF',
                            id: '1',
                            description: 'some decs',
                            type: DownloadFormats.PDF,
                            layoutIntents: ['print'],
                            dataSourceEnabled: false,
                        },
                    ],
                    outputSettingsFullList: [],
                }),
        };
        renderComponent(prjConfig, LayoutIntent.print);

        await waitFor(() => {
            const downloadButton = screen.getByRole('button', { name: /download/i });
            expect(downloadButton).toBeInTheDocument();
        });

        const downloadButton = screen.getByRole('button', { name: /download/i });

        fireEvent.click(downloadButton);
        expect(screen.getByText(/output/i)).toBeInTheDocument();

        const dropdown = screen.getByText(/Single for PDF/i);
        expect(dropdown).toBeInTheDocument();
    });

    it('Shows show correct output seetings when data source is available', async () => {
        prjConfig = {
            ...ProjectConfigs.empty,
            outputSettings: { pdf: true, gif: false },
            onFetchOutputSettings: () =>
                Promise.resolve({
                    userInterface: { id: '1', name: 'name' },
                    outputSettings: [
                        {
                            name: 'Batch for PDF',
                            id: '1',
                            description: 'some decs',
                            type: DownloadFormats.PDF,
                            layoutIntents: ['print'],
                            dataSourceEnabled: true,
                        },
                        {
                            name: 'Single for PDF',
                            id: '1',
                            description: 'some decs',
                            type: DownloadFormats.PDF,
                            layoutIntents: ['print'],
                            dataSourceEnabled: false,
                        },
                    ],
                    outputSettingsFullList: [],
                }),
        };

        renderComponent(prjConfig, LayoutIntent.print, {} as ConnectorInstance);

        await waitFor(() => {
            const downloadButton = screen.getByRole('button', { name: /download/i });
            expect(downloadButton).toBeInTheDocument();
        });

        const downloadButton = screen.getByRole('button', { name: /download/i });

        fireEvent.click(downloadButton);
        expect(screen.getByText(/output/i)).toBeInTheDocument();

        const dropdown = screen.getByText(/Batch for PDF/i);
        expect(dropdown).toBeInTheDocument();
    });
});

class ProjectConfigs {
    static empty: ProjectConfig = {
        projectId: '00000000-0000-0000-0000-000000000000',
        projectName: '',
        uiOptions: { ...defaultPlatformUiOptions, uiTheme: 'light' },
        outputSettings: defaultOutputSettings,
        graFxStudioEnvironmentApiBaseUrl: '',
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
        onBack: () => {
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
