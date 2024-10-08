import { variables } from '@tests/mocks/mockVariables';
import {
    DateVariable as DateVariableType,
    NumberVariable as NumberVariableType,
    ShortTextVariable,
    BooleanVariable as BooleanVariableType,
} from '@chili-publish/studio-sdk';
import { render, screen } from '@testing-library/react';
import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import NumberVariable from '../../../components/variablesComponents/NumberVariable';
import DateVariable from '../../../components/variablesComponents/dateVariable/DateVariable';
import TextVariable from '../../../components/variablesComponents/TextVariable';
import DateVariableMobile from '../../../components/variablesComponents/dateVariable/DateVariableMobile';
import BooleanVariable from '../../../components/variablesComponents/BooleanVariable';

describe('Variable help text', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should display help text for number variable', () => {
        const helpText = 'helpText info';
        const variable = variables.find((item) => item.id === 'number-variable') as NumberVariableType;
        const numberVariable = { ...variable, helpText };
        render(
            <UiThemeProvider theme="platform">
                <NumberVariable variable={numberVariable} onValueChange={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(screen.getByText(helpText)).toBeInTheDocument();
    });

    it('should display help text for date variable', () => {
        const helpText = 'helpText info';
        const variable = variables.find((item) => item.id === 'date-variable') as DateVariableType;
        const dateVariable = { ...variable, helpText };
        render(
            <UiThemeProvider theme="platform">
                <DateVariable variable={dateVariable} onValueChange={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(screen.getByText(helpText)).toBeInTheDocument();
    });

    it('help text should be hidden for open date picker on mobile', () => {
        const helpText = 'helpText info';
        const variable = variables.find((item) => item.id === 'date-variable') as DateVariableType;
        const dateVariable = { ...variable, helpText };
        render(
            <UiThemeProvider theme="platform">
                <DateVariableMobile variable={dateVariable} onDateSelected={jest.fn} />
            </UiThemeProvider>,
        );

        expect(screen.queryByText(helpText)).not.toBeInTheDocument();
    });

    it('should display help text for text variable', () => {
        const helpText = 'helpText info';
        const variable = variables.find((item) => item.id === 'shortVariable 1') as ShortTextVariable;
        const textVariable = { ...variable, helpText };
        render(
            <UiThemeProvider theme="platform">
                <TextVariable variable={textVariable} onValueChange={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(screen.getByText(helpText)).toBeInTheDocument();
    });

    it('should display help text for boolean variable', () => {
        const helpText = 'helpText info';
        const variable = variables.find((item) => item.id === 'boolean-var-id') as BooleanVariableType;
        const booleanVariable = { ...variable, helpText };
        render(
            <UiThemeProvider theme="platform">
                <BooleanVariable variable={booleanVariable} handleValueChange={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(screen.getByText(helpText)).toBeInTheDocument();
    });
});
