import { render, screen } from '@testing-library/react';
import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import VariablesList from '../components/variables/VariablesList';
import { variables } from './mocks/mockVariables';

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
        window.SDK.connector.getMappings = jest.fn().mockResolvedValue({
            parsedData: null,
        });
        window.SDK.variable.getAll = jest.fn().mockResolvedValue({
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
        );

        const variable1 = await screen.findByText('Variable1');
        const variable12 = await screen.findByText('Variable12');
        const shortVariable1 = screen.getByText('Short Variable 1');
        const longVariable1 = screen.queryByText('Long Variable 1');

        expect(variable1).toBeInTheDocument();
        expect(variable12).toBeInTheDocument();
        expect(shortVariable1).toBeInTheDocument();
        expect(longVariable1).not.toBeInTheDocument();
    });
});
