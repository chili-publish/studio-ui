import { act, render, screen, waitFor } from '@testing-library/react';
import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import selectEvent from 'react-select-event';
import VariablesList from '../components/variables/VariablesList';
import { variables } from './mocks/mockVariables';
import { getDataTestIdForSUI } from '../utils/dataIds';
import { APP_WRAPPER } from './shared.util/app';

jest.mock('../components/variablesComponents/imageVariable/useVariableConnector', () => ({
    useVariableConnector: () => ({
        selectedConnector: {
            supportedAuthentication: {
                browser: ['none'],
            },
        },
    }),
}));

describe('Variables List', () => {
    beforeEach(() => {
        window.StudioUISDK.connector.getMappings = jest.fn().mockResolvedValue({
            parsedData: null,
        });
        window.StudioUISDK.variable.getAll = jest.fn().mockResolvedValue({
            parsedData: null,
        });
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('Hidden variables should not be shown', async () => {
        render(
            <UiThemeProvider theme="platform">
                <VariablesList variables={variables} isDocumentLoaded />
            </UiThemeProvider>,
            { container: document.body.appendChild(APP_WRAPPER) },
        );

        const variable1 = await screen.findByText(variables[0].label);
        const variable12 = await screen.findByText(variables[1].label);
        const shortVariable1 = screen.getByText(variables[2].label);
        const longVariable1 = screen.queryByText(variables[3].label);

        expect(variable1).toBeInTheDocument();
        expect(variable12).toBeInTheDocument();
        expect(shortVariable1).toBeInTheDocument();
        expect(longVariable1).not.toBeInTheDocument();
    });

    it('List variable should use "displayValue" for labels', async () => {
        const { getByTestId } = render(
            <UiThemeProvider theme="platform">
                <VariablesList variables={variables} isDocumentLoaded />
            </UiThemeProvider>,
            { container: document.body.appendChild(APP_WRAPPER) },
        );

        const selectIndicator = getByTestId(getDataTestIdForSUI(`dropdown-10`)).getElementsByClassName(
            'grafx-drop-down__dropdown-indicator',
        )[0];
        expect(selectIndicator).toBeInTheDocument();

        act(() => {
            selectEvent.openMenu(selectIndicator as unknown as HTMLElement);
        });

        await waitFor(() => {
            expect(screen.getByText('List')).toBeInTheDocument();
            expect(screen.getByText('Val 1')).toBeInTheDocument();
            expect(screen.getByText('val 2')).toBeInTheDocument();
        });
    });
});
