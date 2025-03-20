/* eslint-disable react/jsx-props-no-spreading, @typescript-eslint/no-explicit-any */
import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import selectEvent from 'react-select-event';
import { AxiosResponse } from 'axios';
import { mockUserInterface, mockUserInterface2 } from '@mocks/mockUserinterface';
import { LayoutIntent } from '@chili-publish/studio-sdk';
import userEvent from '@testing-library/user-event';
import {
    defaultOutputSettings,
    defaultPlatformUiOptions,
    PaginatedResponse,
    ProjectConfig,
    UserInterface,
    UserInterfaceWithOutputSettings,
} from '../../types/types';
import { getDataTestIdForSUI } from '../../utils/dataIds';
import StudioNavbar from '../../components/navbar/studioNavbar/StudioNavbar';
import { OutputSettingsContextProvider } from '../../components/navbar/OutputSettingsContext';
import { UiConfigContextProvider } from '../../contexts/UiConfigContext';

type OutpuSettingsFn = (_?: string | undefined) => Promise<UserInterfaceWithOutputSettings | null>;

const getPrjConfig = (fetchOuptputSettingsFn: OutpuSettingsFn): ProjectConfig => ({
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
    onFetchOutputSettings: fetchOuptputSettingsFn,
    onFetchUserInterfaces: async () => {
        return Promise.resolve({
            status: 200,
            data: { data: [mockUserInterface, mockUserInterface2] },
        } as unknown as AxiosResponse<PaginatedResponse<UserInterface>, any>);
    },
});

const renderTemplate = (fetchOuptputSettingsFn: OutpuSettingsFn) => {
    const projectConfig = getPrjConfig(fetchOuptputSettingsFn);

    const navbarProps = {
        projectName: 'test project',
        goBack: jest.fn(),
        zoom: 100,
        undoStackState: { canRedo: true, canUndo: true },
        projectConfig,
    };
    render(
        <UiConfigContextProvider projectConfig={projectConfig}>
            <OutputSettingsContextProvider projectConfig={projectConfig} layoutIntent={LayoutIntent.digitalAnimated}>
                <UiThemeProvider theme="studio" mode="dark">
                    <StudioNavbar {...navbarProps} />
                </UiThemeProvider>
            </OutputSettingsContextProvider>
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
                outputSettingsFullList: [],
            }),
        );
        renderTemplate(fetchOutputSettings);

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
});
