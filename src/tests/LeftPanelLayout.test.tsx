/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import EditorSDK, { Layout, LayoutIntent, LayoutListItemType, LayoutPropertiesType } from '@chili-publish/studio-sdk';
import { mockLayout, mockLayouts } from '@mocks/mockLayout';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import selectEvent from 'react-select-event';
import { transformFormBuilderArrayToObject } from '../utils/helpers';
import { mockConnectors } from '../../__mocks__/mockConnectors';
import LeftPanel from '../components/layout-panels/leftPanel/LeftPanel';
import { VariablePanelContextProvider } from '../contexts/VariablePanelContext';
import { getDataTestIdForSUI } from '../utils/dataIds';
import { variables } from './mocks/mockVariables';
import { APP_WRAPPER } from './shared.util/app';
import { UserInterfaceDetailsContextProvider } from '../components/navbar/UserInterfaceDetailsContext';
import {
    defaultOutputSettings,
    defaultPlatformUiOptions,
    FormBuilderArray,
    ProjectConfig,
    LayoutForm,
    DataSourceForm,
    VariablesForm,
} from '../types/types';

afterEach(() => {
    jest.clearAllMocks();
});
const mockSDK = mock<EditorSDK>();

const renderComponent = (layoutIntent?: LayoutIntent, layouts?: LayoutListItemType[], selectedLayout?: Layout) => {
    const formBuilder = transformFormBuilderArrayToObject(mockUserInterface.formBuilder as FormBuilderArray);
    const projectConfig = {
        ...ProjectConfigs.empty,
        onFetchOutputSettings: () =>
            Promise.resolve({
                userInterface: { id: '1', name: 'name' },
                outputSettings: [
                    { ...mockOutputSetting, layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'] },
                ],
                formBuilder,
            }),
        onFetchUserInterfaceDetails: () =>
            Promise.resolve({
                userInterface: { id: '1', name: 'name' },
                outputSettings: [
                    { ...mockOutputSetting, layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'] },
                ],
                formBuilder,
            }),
        uiOptions: {
            ...ProjectConfigs.empty.uiOptions,
            ...(formBuilder.layouts && {
                layouts: formBuilder.layouts as LayoutForm,
            }),
            ...(formBuilder.datasource && {
                datasource: formBuilder.datasource as DataSourceForm,
            }),
            ...(formBuilder.variables && {
                variables: formBuilder.variables as VariablesForm,
            }),
        },
    };

    render(
        <UiThemeProvider theme="platform">
            <VariablePanelContextProvider connectors={mockConnectors} variables={variables}>
                <UserInterfaceDetailsContextProvider
                    projectConfig={projectConfig}
                    layoutIntent={layoutIntent || LayoutIntent.digitalAnimated}
                >
                    <LeftPanel
                        variables={variables}
                        selectedLayout={selectedLayout || mockLayout}
                        layouts={layouts || mockLayouts}
                        layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                        layoutSectionUIOptions={{
                            visible: true,
                            layoutSwitcherVisible: true,
                            title: 'Layout',
                        }}
                    />
                </UserInterfaceDetailsContextProvider>
            </VariablePanelContextProvider>
        </UiThemeProvider>,
        { container: document.body.appendChild(APP_WRAPPER) },
    );
};
describe('Layout selection', () => {
    mockSDK.layout.select = jest.fn().mockResolvedValue({
        parsedData: null,
    });
    window.StudioUISDK = mockSDK;
    test('Layout dropdown and dimension inputs are rendered based on layout properties', async () => {
        const singleAvailableLayout = [mockLayouts[1]];

        renderComponent(LayoutIntent.print, singleAvailableLayout, mockLayout);

        // Verify dropdown not shown with single layout
        expect(screen.queryByTestId(getDataTestIdForSUI('dropdown-available-layout'))).not.toBeInTheDocument();
        // Verify dimension inputs shown for resizable layout
        const width = await screen.findByLabelText('Width');
        const height = await screen.findByLabelText('Height');
        expect(width).toBeInTheDocument();
        expect(height).toBeInTheDocument();

        // Re-render with non-resizable layout
        const nonResizableLayout = {
            ...mockLayout,
            resizableByUser: { ...mockLayout.resizableByUser, enabled: false },
        };

        renderComponent(LayoutIntent.print, singleAvailableLayout, nonResizableLayout);
        // Verify dimension inputs not shown for non-resizable layout
        expect(screen.queryByLabelText('Width')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Height')).not.toBeInTheDocument();
    });

    test('Layout dropdown is displayed when multiple layouts are available for user', async () => {
        renderComponent();

        expect(screen.getByText('Customize')).toBeInTheDocument();

        const selectIndicator = screen
            .getByTestId(getDataTestIdForSUI(`dropdown-available-layout`))
            .getElementsByClassName('grafx-select__dropdown-indicator')[0];
        expect(selectIndicator).toBeInTheDocument();

        await act(async () => {
            await selectEvent.openMenu(selectIndicator as HTMLElement);
        });
        expect(screen.queryByText(mockLayouts[0].name)).not.toBeInTheDocument();
        expect(screen.getByRole('option', { name: /l1 display name/i })).toBeInTheDocument();
        expect(screen.getByText(mockLayouts[2].name)).toBeInTheDocument();
        expect(screen.getByText(mockLayouts[3].displayName!)).toBeInTheDocument();

        await act(async () => {
            await userEvent.click(screen.getByRole('option', { name: /l3 display name/i }));
        });

        await waitFor(() => {
            expect(window.StudioUISDK.layout.select).toHaveBeenCalledWith(mockLayouts[3].id);
        });
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
