import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import VariableComponent from '../components/variablesComponents/VariablesComponents';
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

describe('Variable Component', () => {
    it('Shows the image picker component for image variable', async () => {
        render(
            <VariableComponent
                key={`variable-component-${variables[0].id}`}
                type={variables[0].type} // image variable
                variable={variables[0]}
                isDocumentLoaded
            />,
        );
        const variable = await waitFor(() => screen.getByText('Variable1'));
        expect(variable).toBeInTheDocument();
    });

    it('Shows the input component for short text and long text variables', () => {
        let container = render(
            <VariableComponent
                key={`variable-component-${variables[2].id}`}
                type={variables[2].type} // short text variable
                variable={variables[2]}
                isDocumentLoaded
            />,
        );
        const input = container.container.getElementsByTagName('input')[0];
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: 'I just got updated' } });
        fireEvent.blur(input);

        expect(screen.getByText('Short Variable 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('I just got updated')).toHaveAttribute('value', 'I just got updated');

        container = render(
            <VariableComponent
                key={`variable-component-${variables[3].id}`}
                type={variables[3].type} // short text variable
                variable={variables[3]}
                isDocumentLoaded
            />,
        );

        const inputLong = container.container.getElementsByTagName('input')[0];
        fireEvent.focus(inputLong);
        fireEvent.change(inputLong, { target: { value: 'I just got longer' } });
        fireEvent.blur(inputLong);

        expect(screen.getByText('Long Variable 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('I just got longer')).toHaveAttribute('value', 'I just got longer');
    });
    it('Shows the number component for number variables', () => {
        const { getByRole, getAllByRole } = render(
            <VariableComponent
                key={`variable-component-${variables[5].id}`}
                type={variables[5].type}
                variable={variables[5]}
                isDocumentLoaded
            />,
        );
        screen.logTestingPlaygroundURL();
        const input = getByRole('textbox', { name: /number-variable/i });
        const stepBtns = getAllByRole('button');
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue('13.55');
        expect(stepBtns.length).toBe(2);

        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: 12.11 } });
        fireEvent.blur(input);

        expect(input).toHaveValue('12.11');
    });
});
