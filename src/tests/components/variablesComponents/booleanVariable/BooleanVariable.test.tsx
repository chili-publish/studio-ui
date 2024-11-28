import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { BooleanVariable as Type } from '@chili-publish/studio-sdk';
import { render, screen } from '@testing-library/react';
import { variables } from '@tests/mocks/mockVariables';
import BooleanVariable from '../../../../components/variablesComponents/BooleanVariable';

jest.mock('../../../../contexts/FeatureFlagProvider', () => ({
    useFeatureFlagContext: () => ({
        featureFlags: {
            STUDIO_LABEL_PROPERTY_ENABLED: true,
        },
    }),
}));

describe('BooleanVariable', () => {
    it('should display label as variable name', () => {
        const booleanVar = {
            ...(variables.find((item) => item.id === 'boolean-var-id') as Type),
        };
        render(
            <UiThemeProvider theme="platform">
                <BooleanVariable variable={{ ...booleanVar, label: '' }} handleValueChange={jest.fn()} />;
            </UiThemeProvider>,
        );

        expect(screen.getByText(booleanVar.name)).toBeInTheDocument();
    });

    it('should display label as variable label', () => {
        const booleanVar = {
            ...(variables.find((item) => item.id === 'boolean-var-id') as Type),
        };
        render(
            <UiThemeProvider theme="platform">
                <BooleanVariable variable={booleanVar} handleValueChange={jest.fn()} />;
            </UiThemeProvider>,
        );

        expect(screen.getByText(booleanVar.label)).toBeInTheDocument();
    });
});
