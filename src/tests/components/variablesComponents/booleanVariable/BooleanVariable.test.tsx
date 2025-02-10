/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { BooleanVariable as Type } from '@chili-publish/studio-sdk';
import { render, screen } from '@testing-library/react';
import { variables } from '@tests/mocks/mockVariables';
import BooleanVariable from '../../../../components/variablesComponents/BooleanVariable';

describe('BooleanVariable', () => {
    it('should display label as variable label if label is empty', () => {
        const booleanVar = {
            ...(variables.find((item) => item.id === 'boolean-var-id') as Type),
        };
        render(
            <UiThemeProvider theme="platform">
                <BooleanVariable variable={{ ...booleanVar, label: '' }} handleValueChange={jest.fn()} />;
            </UiThemeProvider>,
        );

        const variableLabel = screen.queryByText(booleanVar.label!);
        // the label is empty string won't be rendered
        expect(variableLabel).toBeNull();
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

        expect(screen.getByText(booleanVar.label!)).toBeInTheDocument();
    });
    it('should display label as variable name if label does not exist', () => {
        const booleanVar = {
            ...(variables.find((item) => item.id === 'boolean-var-id') as Type),
        };
        delete (booleanVar as unknown as { [key: string]: string }).label;

        render(
            <UiThemeProvider theme="platform">
                <BooleanVariable variable={{ ...booleanVar }} handleValueChange={jest.fn()} />;
            </UiThemeProvider>,
        );

        expect(screen.getByText(booleanVar.name)).toBeInTheDocument();
    });
});
