import { getDataTestId, UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { NumberVariable as Type } from '@chili-publish/studio-sdk';
import { render, screen } from '@testing-library/react';
import { variables } from '@tests/mocks/mockVariables';
import NumberVariable from '../../../../components/variablesComponents/NumberVariable';

jest.mock('../../../../contexts/FeatureFlagProvider', () => ({
    useFeatureFlagContext: () => ({
        featureFlags: {
            STUDIO_LABEL_PROPERTY_ENABLED: true,
        },
    }),
}));

describe('NumberVariable', () => {
    it('should display label as variable name', () => {
        const variable = variables.find((item) => item.id === 'number-variable');
        const numberVariable = { ...variable, label: '' } as Type;
        render(
            <UiThemeProvider theme="platform">
                <NumberVariable variable={numberVariable} onValueChange={jest.fn()} />;
            </UiThemeProvider>,
        );

        expect(screen.getByTestId(getDataTestId('input-label')).innerHTML).toEqual(numberVariable.name);
    });

    it('should display label as variable label', () => {
        const variable = variables.find((item) => item.id === 'number-variable');
        const numberVariable = { ...variable } as Type;
        render(
            <UiThemeProvider theme="platform">
                <NumberVariable variable={numberVariable} onValueChange={jest.fn()} />;
            </UiThemeProvider>,
        );

        expect(screen.getByTestId(getDataTestId('input-label')).innerHTML).toEqual(numberVariable.label);
    });
});
