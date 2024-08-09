import { LongTextVariable } from '@chili-publish/studio-sdk';
import { render, screen } from '@testing-library/react';
import { variables } from '@tests/mocks/mockVariables';
import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import TextVariable from '../../../../components/variablesComponents/TextVariable';

describe('TextVariable', () => {
    it('should display the configured placeholder', () => {
        const PLACEHOLDER = 'placeholder text';
        const variable = variables.find((item) => item.id === 'longVariable1');
        const textVariable = { ...variable, placeholder: PLACEHOLDER } as LongTextVariable;
        render(
            <UiThemeProvider theme="platform">
                <TextVariable variable={textVariable} handleValueChange={jest.fn()} />;
            </UiThemeProvider>,
        );

        expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeInTheDocument();
    });
});
