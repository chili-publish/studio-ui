import { getDataTestId, UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { ListVariable as Type } from '@chili-publish/studio-sdk/lib/src/next';
import { render, screen } from '@testing-library/react';
import { variables } from '@tests/mocks/mockVariables';
import ListVariable from '../../../../components/variablesComponents/listVariable/ListVariable';

jest.mock('../../../../contexts/FeatureFlagProvider', () => ({
    useFeatureFlagContext: () => ({
        featureFlags: {
            STUDIO_LABEL_PROPERTY_ENABLED: true,
        },
    }),
}));

describe('ListVariable', () => {
    it('should display label as variable name', () => {
        const variable = variables.find((item) => item.id === '10');
        const listVariable = { ...variable, label: '' } as Type;
        render(
            <UiThemeProvider theme="platform">
                <ListVariable variable={listVariable} onChange={jest.fn()} />;
            </UiThemeProvider>,
        );

        expect(screen.getByTestId(getDataTestId('input-label')).innerHTML).toEqual(listVariable.name);
    });

    it('should display label as variable label', () => {
        const variable = variables.find((item) => item.id === '10');
        const listVariable = { ...variable } as Type;
        render(
            <UiThemeProvider theme="platform">
                <ListVariable variable={listVariable} onChange={jest.fn()} />;
            </UiThemeProvider>,
        );

        expect(screen.getByTestId(getDataTestId('input-label')).innerHTML).toEqual(listVariable.label);
    });
});
