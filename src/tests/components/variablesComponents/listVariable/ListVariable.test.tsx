import { getDataTestId, UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { ListVariable as Type } from '@chili-publish/studio-sdk/lib/src/next';
import { render, screen } from '@testing-library/react';
import { variables } from '@tests/mocks/mockVariables';
import ListVariable from '../../../../components/variablesComponents/listVariable/ListVariable';

describe('ListVariable', () => {
    it('should display label as variable name if label is empty', () => {
        const variable = variables.find((item) => item.id === '10');
        const listVariable = { ...variable, label: '' } as Type;
        render(
            <UiThemeProvider theme="platform">
                <ListVariable variable={listVariable} onChange={jest.fn()} />;
            </UiThemeProvider>,
        );
        const variableLabel = screen.queryByTestId(getDataTestId('input-label'));
        // the label is empty string won't be rendered
        expect(variableLabel).toBeNull();
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

    it('should display label as variable name if label does not exist', () => {
        const variable = variables.find((item) => item.id === '10');
        const listVariable = { ...variable } as Type;
        delete (listVariable as unknown as { [key: string]: string }).label;

        render(
            <UiThemeProvider theme="platform">
                <ListVariable variable={listVariable} onChange={jest.fn()} />;
            </UiThemeProvider>,
        );

        expect(screen.getByTestId(getDataTestId('input-label')).innerHTML).toEqual(listVariable.name);
    });
});
