import { UiThemeProvider, getDataTestId } from '@chili-publish/grafx-shared-components';
import { DownloadFormats, LayoutIntent } from '@chili-publish/studio-sdk';
import { ConnectorInstance } from '@chili-publish/studio-sdk/lib/src/next';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { ProjectConfigs } from '@tests/mocks/MockProjectConfig';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@tests/mocks/Provider';
import Navbar from '../../components/navbar/Navbar';
import AppProvider from '../../contexts/AppProvider';
import { FormBuilderType, ProjectConfig } from '../../types/types';
import { APP_WRAPPER_ID } from '../../utils/constants';
import { getDataTestIdForSUI } from '../../utils/dataIds';
import { UserInterfaceDetailsContextProvider } from '../../components/navbar/UserInterfaceDetailsContext';
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
                formBuilder: mockUserInterface.formBuilder,
                outputSettingsFullList: [],
            }),
        onFetchUserInterfaceDetails: () =>
            Promise.resolve({
                userInterface: { id: '1', name: 'name' },
                outputSettings: [
                    { ...mockOutputSetting, layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'] },
                ],
                formBuilder: mockUserInterface.formBuilder as unknown as FormBuilderType,
                outputSettingsFullList: [],
            }),
    };
    const projectConfig = config || prjConfig;

    renderWithProviders(
        <AppProvider dataSource={dataSource || undefined}>
            <UiConfigContextProvider projectConfig={projectConfig as ProjectConfig}>
                <UserInterfaceDetailsContextProvider
                    projectConfig={projectConfig as ProjectConfig}
                    layoutIntent={layoutIntent || LayoutIntent.digitalAnimated}
                >
                    <div id={APP_WRAPPER_ID}>
                        <UiThemeProvider theme="platform">
                            <Navbar
                                projectName=""
                                projectConfig={projectConfig as ProjectConfig}
                                zoom={100}
                                undoStackState={{
                                    canRedo: false,
                                    canUndo: false,
                                }}
                                selectedLayoutId="123"
                            />
                        </UiThemeProvider>
                    </div>
                </UserInterfaceDetailsContextProvider>
            </UiConfigContextProvider>
        </AppProvider>,
    );
};
describe('Navbar', () => {
    let prjConfig: ProjectConfig;
    beforeEach(() => {
        prjConfig = {
            ...ProjectConfigs.empty,
            onFetchUserInterfaceDetails: () =>
                Promise.resolve({
                    userInterface: { id: '1', name: 'name' },
                    outputSettings: [
                        { ...mockOutputSetting, layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'] },
                    ],
                    formBuilder: mockUserInterface.formBuilder as unknown as FormBuilderType,
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
            onFetchUserInterfaceDetails: () =>
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
                    formBuilder: mockUserInterface.formBuilder as unknown as FormBuilderType,
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
            onFetchUserInterfaceDetails: () =>
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
                    formBuilder: mockUserInterface.formBuilder as unknown as FormBuilderType,
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
            onFetchUserInterfaceDetails: () =>
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
                    formBuilder: mockUserInterface.formBuilder as unknown as FormBuilderType,
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
