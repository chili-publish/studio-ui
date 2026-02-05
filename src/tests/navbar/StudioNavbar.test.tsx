import { UiThemeProvider } from '@chili-publish/grafx-shared-components';

import { act, screen, waitFor, within } from '@testing-library/react';
import selectEvent from 'react-select-event';
import { mockUserInterface, mockUserInterface2 } from '@mocks/mockUserinterface';
import { LayoutIntent } from '@chili-publish/studio-sdk';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/mocks/Provider';
import { EnvironmentApiService } from 'src/services/EnvironmentApiService';
import {
    defaultOutputSettings,
    defaultPlatformUiOptions,
    FormBuilderType,
    ProjectConfig,
    UiOptions,
    UserInterfaceWithOutputSettings,
} from '../../types/types';
import { getDataTestIdForSUI } from '../../utils/dataIds';
import StudioNavbar from '../../components/navbar/studioNavbar/StudioNavbar';
import { UserInterfaceDetailsContextProvider } from '../../components/navbar/UserInterfaceDetailsContext';
import { UiConfigContextProvider } from '../../contexts/UiConfigContext';

type OutpuSettingsFn = (_?: string | undefined) => Promise<UserInterfaceWithOutputSettings | null>;

const getPrjConfig = (projectConfig: Partial<ProjectConfig>): ProjectConfig => ({
    projectId: '1111-111-0000-0000-1111',
    projectName: '',
    uiOptions: { ...defaultPlatformUiOptions, uiTheme: 'dark' },
    outputSettings: defaultOutputSettings,
    graFxStudioEnvironmentApiBaseUrl: '',
    sandboxMode: true,
    onProjectInfoRequested: async () => {
        return { name: '', id: '', template: { id: '1111-111-0000-0000-1111' } };
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
            id: '1111-111-0000-0000-1111',
            template: { id: '1111-111-0000-0000-1111' },
        };
    },
    onBack: () => {
        // ignored
    },
    onLogInfoRequested: () => {
        // ignored
    },
    onEngineInitialized: () => {
        // ignored
    },
    onGenerateOutput: async () => {
        return { extensionType: 'pdf', outputData: new Blob() };
    },
    onFetchUserInterfaceDetails: projectConfig.onFetchOutputSettings,
    onFetchOutputSettings: projectConfig.onFetchOutputSettings ?? (() => Promise.resolve(null)),
    onFetchUserInterfaces: async () => {
        return {
            data: [mockUserInterface, mockUserInterface2],
            pageSize: 10,
        };
    },
    ...(projectConfig.uiOptions && { uiOptions: projectConfig.uiOptions }),
    environmentApiService: {
        getProjectById: jest.fn().mockResolvedValue({
            id: '00000000-0000-0000-0000-000000000000',
            name: 'mockProjectName',
            template: { id: 'dddddd' },
        }),
        getProjectDocument: jest.fn().mockResolvedValue({ data: { mock: 'data' } }),
        saveProjectDocument: jest.fn().mockResolvedValue({ success: true }),
    } as unknown as EnvironmentApiService,
});

const renderTemplate = (fetchOuptputSettingsFn?: OutpuSettingsFn, uiOptions?: UiOptions) => {
    const projectConfig = getPrjConfig({ onFetchOutputSettings: fetchOuptputSettingsFn, uiOptions });

    const navbarProps = {
        projectName: 'test project',
        goBack: jest.fn(),
        zoom: 100,
        undoStackState: { canRedo: true, canUndo: true },
        projectConfig,
        layoutIntent: LayoutIntent.digitalAnimated,
        selectedLayoutId: '123',
    };
    renderWithProviders(
        <UiConfigContextProvider projectConfig={projectConfig}>
            <UserInterfaceDetailsContextProvider
                projectConfig={projectConfig}
                layoutIntent={LayoutIntent.digitalAnimated}
            >
                <UiThemeProvider theme="studio" mode="dark">
                    <StudioNavbar {...navbarProps} />
                </UiThemeProvider>
            </UserInterfaceDetailsContextProvider>
        </UiConfigContextProvider>,
    );
};
describe('StudioNavbar', () => {
    const user = userEvent.setup();
    it('should be able to select an user interface', async () => {
        const fetchOutputSettings = jest.fn(() =>
            Promise.resolve({
                userInterface: { id: mockUserInterface.id, name: mockUserInterface.name },
                outputSettings: [],
                formBuilder: mockUserInterface.formBuilder as unknown as FormBuilderType,
                outputSettingsFullList: [],
            }),
        );
        renderTemplate(fetchOutputSettings);

        expect(screen.getByTestId(getDataTestIdForSUI(`studio-navbar-item-user-interface`))).toBeInTheDocument();

        const selectIndicator = within(screen.getByTestId(getDataTestIdForSUI(`dropdown-user-interface`))).getByRole(
            'combobox',
        );
        expect(selectIndicator).toBeInTheDocument();

        act(() => {
            selectEvent.openMenu(selectIndicator as unknown as HTMLElement);
        });

        await waitFor(() => {
            expect(screen.getByText(mockUserInterface.name)).toBeInTheDocument();
            expect(screen.getByText(mockUserInterface2.name)).toBeInTheDocument();
        });

        const userInterfaceOption = screen.getByText(mockUserInterface2.name);

        await act(async () => {
            await user.click(userInterfaceOption);
        });

        expect(fetchOutputSettings).toHaveBeenCalledWith(mockUserInterface2.id);
    });

    it('should not show the user interface dropdown when the download button is not visible', () => {
        renderTemplate(undefined, { widgets: { downloadButton: { visible: false } } });

        expect(screen.queryByTestId(getDataTestIdForSUI(`studio-navbar-item-user-interface`))).not.toBeInTheDocument();
    });
});
