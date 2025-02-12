/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { act, render, screen, waitFor } from '@testing-library/react';
import { mockLayout, mockLayouts } from '@mocks/mockLayout';
import selectEvent from 'react-select-event';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import EditorSDK, { LayoutPropertiesType } from '@chili-publish/studio-sdk';
import LeftPanel from '../components/layout-panels/leftPanel/LeftPanel';
import { VariablePanelContextProvider } from '../contexts/VariablePanelContext';
import { mockConnectors } from '../../__mocks__/mockConnectors';
import { variables } from './mocks/mockVariables';
import { APP_WRAPPER } from './shared.util/app';
import { getDataTestIdForSUI } from '../utils/dataIds';

afterEach(() => {
    jest.clearAllMocks();
});
const mockSDK = mock<EditorSDK>();

describe('Layout selection', () => {
    mockSDK.layout.select = jest.fn().mockResolvedValue({
        parsedData: null,
    });
    window.StudioUISDK = mockSDK;

    test('Layout dropdown is not displayed when only one layout is available for user', () => {
        const singleAvailableLayout = [
            mockLayouts[1], // Only one layout available for user
        ];

        render(
            <UiThemeProvider theme="platform">
                <VariablePanelContextProvider connectors={mockConnectors} variables={variables}>
                    <LeftPanel
                        variables={variables}
                        selectedLayout={mockLayout}
                        layouts={singleAvailableLayout}
                        layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                    />
                </VariablePanelContextProvider>
            </UiThemeProvider>,
            { container: document.body.appendChild(APP_WRAPPER) },
        );

        expect(screen.getByText('Customize')).toBeInTheDocument();
        expect(screen.getByLabelText('Width')).toBeInTheDocument();
        expect(screen.getByLabelText('Height')).toBeInTheDocument();
        expect(screen.queryByTestId(getDataTestIdForSUI('dropdown-available-layout'))).not.toBeInTheDocument();
    });

    test('Layout dropdown is displayed when multiple layouts are available for user', async () => {
        render(
            <UiThemeProvider theme="platform">
                <VariablePanelContextProvider connectors={mockConnectors} variables={variables}>
                    <LeftPanel
                        variables={variables}
                        selectedLayout={mockLayout}
                        layouts={mockLayouts}
                        layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                    />
                </VariablePanelContextProvider>
            </UiThemeProvider>,
            { container: document.body.appendChild(APP_WRAPPER) },
        );

        expect(screen.getByText('Customize')).toBeInTheDocument();

        const selectIndicator = screen
            .getByTestId(getDataTestIdForSUI(`dropdown-available-layout`))
            .getElementsByClassName('grafx-select__dropdown-indicator')[0];
        expect(selectIndicator).toBeInTheDocument();

        await act(async () => {
            await selectEvent.openMenu(selectIndicator as HTMLElement);
        });
        screen.logTestingPlaygroundURL();
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
