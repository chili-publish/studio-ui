/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { act, render, screen, waitFor } from '@testing-library/react';
import { mockLayout, mockLayouts } from '@mocks/mockLayout';
import selectEvent from 'react-select-event';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import EditorSDK from '@chili-publish/studio-sdk';
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
    test('Layout dropdown is not display when only one available for user layout is present', async () => {
        const availableForUserLayouts = [mockLayouts[0], mockLayouts[1]];
        render(
            <UiThemeProvider theme="platform">
                <VariablePanelContextProvider connectors={mockConnectors} variables={variables}>
                    <LeftPanel variables={variables} selectedLayout={mockLayout} layouts={availableForUserLayouts} />
                </VariablePanelContextProvider>
            </UiThemeProvider>,
            { container: document.body.appendChild(APP_WRAPPER) },
        );

        expect(screen.getByText('Customize')).toBeInTheDocument();
        expect(screen.queryByText('Layout')).not.toBeInTheDocument();
    });

    test('Layout dropdown is display when there are more than 2 layouts available', async () => {
        render(
            <UiThemeProvider theme="platform">
                <VariablePanelContextProvider connectors={mockConnectors} variables={variables}>
                    <LeftPanel variables={variables} selectedLayout={mockLayout} layouts={mockLayouts} />
                </VariablePanelContextProvider>
            </UiThemeProvider>,
            { container: document.body.appendChild(APP_WRAPPER) },
        );

        expect(screen.getByText('Customize')).toBeInTheDocument();
        expect(screen.getByText('Layout')).toBeInTheDocument();

        const selectIndicator = screen
            .getByTestId(getDataTestIdForSUI(`dropdown-available-layout`))
            .getElementsByClassName('grafx-select__dropdown-indicator')[0];
        expect(selectIndicator).toBeInTheDocument();

        act(() => {
            selectEvent.openMenu(selectIndicator as unknown as HTMLElement);
        });

        expect(screen.queryByText(mockLayouts[0].name)).not.toBeInTheDocument();
        expect(screen.getByText(mockLayouts[1].displayName!)).toBeInTheDocument();
        // layout does not have display name
        expect(screen.getByText(mockLayouts[2].name)).toBeInTheDocument();
        expect(screen.getByText(mockLayouts[3].displayName!)).toBeInTheDocument();

        await act(async () => {
            await userEvent.click(screen.getByText(mockLayouts[3].displayName!));
        });

        await waitFor(() => {
            expect(window.StudioUISDK.layout.select).toHaveBeenCalledWith(mockLayouts[3].id);
        });
    });
});
