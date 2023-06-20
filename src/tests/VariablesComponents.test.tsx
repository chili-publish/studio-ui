import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import EditorSDK from '@chili-publish/studio-sdk';
import { mock } from 'jest-mock-extended';
import VariableComponent from '../components/variablesComponents/VariablesComponents';
import { variables } from './mocks/mockVariables';

beforeEach(() => {
    jest.mock('@chili-publish/studio-sdk');
    const mockSDK = mock<EditorSDK>();
    mockSDK.mediaConnector.detail = jest
        .fn()
        .mockImplementation()
        .mockReturnValue(
            Promise.resolve({
                parsedData: {
                    id: 'f82a05ba-c592-4f3f-89a3-5b92ca096d01',
                    name: 'Overprint Doc FOGRA',
                    relativePath: '/00 CHILI SUPPORT',
                    type: 0,
                    extension: 'jpeg',
                    metaData: {},
                },
            }),
        );

    mockSDK.mediaConnector.download = jest
        .fn()
        .mockImplementation()
        .mockReturnValue(Promise.resolve([1, 2, 3]));

    mockSDK.connector.getById = jest
        .fn()
        .mockImplementation()
        .mockReturnValue(Promise.resolve({ parsedData: { type: 'ready' } }));
    mockSDK.variable.setValue = jest.fn().mockImplementation();

    window.SDK = mockSDK;
});

describe('Variable Component', () => {
    it('Shows the image picker component for image variable', async () => {
        render(
            <VariableComponent
                key={`variable-component-${variables[0].id}`}
                type={variables[0].type} // image variable
                variable={variables[0]}
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
            />,
        );

        const inputLong = container.container.getElementsByTagName('input')[0];
        fireEvent.focus(inputLong);
        fireEvent.change(inputLong, { target: { value: 'I just got longer' } });
        fireEvent.blur(inputLong);

        expect(screen.getByText('Long Variable 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('I just got longer')).toHaveAttribute('value', 'I just got longer');
    });

    it('Shows the select component for group variable', async () => {
        render(
            <VariableComponent
                key={`variable-component-${variables[4].id}`}
                type={variables[4].type} // image variable
                variable={variables[4]}
            />,
        );
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
});
