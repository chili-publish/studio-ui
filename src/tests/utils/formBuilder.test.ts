import { FormBuilderArray, defaultFormBuilder } from '../../types/types';
import { transformFormBuilderArrayToObject } from '../../utils/helpers';

describe('FormBuilder functionality', () => {
    describe('transformFormBuilderArrayToObject', () => {
        it('should handle undefined input', () => {
            const result = transformFormBuilderArrayToObject(undefined);
            expect(result).toEqual({
                datasource: undefined,
                layouts: undefined,
                variables: undefined,
            });
        });

        it('should handle empty array', () => {
            const result = transformFormBuilderArrayToObject([]);
            expect(result).toEqual({
                datasource: undefined,
                layouts: undefined,
                variables: undefined,
            });
        });

        it('should transform array to object correctly', () => {
            const input: FormBuilderArray = [
                {
                    type: 'datasource',
                    active: true,
                    header: 'Test Data Source',
                    helpText: 'Help text for data source',
                },
                {
                    type: 'layouts',
                    active: true,
                    header: 'Test Layouts',
                    helpText: 'Help text for layouts',
                    layoutSelector: true,
                    multipleLayouts: true,
                    allowNewProjectFromLayout: true,
                    showWidthHeightInputs: true,
                },
                {
                    type: 'variables',
                    active: true,
                    header: 'Test Variables',
                    helpText: 'Help text for variables',
                },
            ];

            const result = transformFormBuilderArrayToObject(input);

            expect(result.datasource).toBeDefined();
            expect(result.layouts).toBeDefined();
            expect(result.variables).toBeDefined();

            expect(result.datasource?.type).toBe('datasource');
            expect(result.layouts?.type).toBe('layouts');
            expect(result.variables?.type).toBe('variables');
        });

        it('should handle partial form builder array', () => {
            const input: FormBuilderArray = [
                {
                    type: 'datasource',
                    active: true,
                    header: 'Test Data Source',
                    helpText: 'Help text for data source',
                },
            ];

            const result = transformFormBuilderArrayToObject(input);

            expect(result.datasource).toBeDefined();
            expect(result.layouts).toBeUndefined();
            expect(result.variables).toBeUndefined();
        });

        it('should handle duplicate form types', () => {
            const input: FormBuilderArray = [
                {
                    type: 'datasource',
                    active: true,
                    header: 'First Data Source',
                    helpText: 'First help text',
                },
                {
                    type: 'datasource',
                    active: false,
                    header: 'Second Data Source',
                    helpText: 'Second help text',
                },
            ];

            const result = transformFormBuilderArrayToObject(input);

            expect(result.datasource).toBeDefined();
            expect(result.datasource?.header).toBe('Second Data Source'); // Last one should win
        });
    });

    describe('FormBuilder state changes', () => {
        it('should handle form builder with all sections inactive', () => {
            const input: FormBuilderArray = [
                {
                    type: 'datasource',
                    active: false,
                    header: 'Data Source',
                    helpText: 'Help text',
                },
                {
                    type: 'layouts',
                    active: false,
                    header: 'Layouts',
                    helpText: 'Help text',
                    layoutSelector: true,
                    multipleLayouts: true,
                    allowNewProjectFromLayout: true,
                    showWidthHeightInputs: true,
                },
                {
                    type: 'variables',
                    active: false,
                    header: 'Variables',
                    helpText: 'Help text',
                },
            ];

            const result = transformFormBuilderArrayToObject(input);

            expect(result.datasource?.active).toBe(false);
            expect(result.layouts?.active).toBe(false);
            expect(result.variables?.active).toBe(false);
        });

        it('should handle form builder with missing layout properties', () => {
            const input: FormBuilderArray = [
                {
                    type: 'layouts',
                    active: true,
                    header: 'Layouts',
                    helpText: 'Help text',
                    layoutSelector: false,
                    multipleLayouts: false,
                    allowNewProjectFromLayout: false,
                    showWidthHeightInputs: false,
                },
            ];

            const result = transformFormBuilderArrayToObject(input);

            expect(result.layouts?.layoutSelector).toBe(false);
            expect(result.layouts?.multipleLayouts).toBe(false);
            expect(result.layouts?.allowNewProjectFromLayout).toBe(false);
            expect(result.layouts?.showWidthHeightInputs).toBe(false);
        });
    });

    describe('Default FormBuilder', () => {
        it('should have correct default values', () => {
            expect(defaultFormBuilder.datasource).toEqual({
                type: 'datasource',
                active: true,
                header: 'Data source',
                helpText: '',
            });

            expect(defaultFormBuilder.layouts).toEqual({
                type: 'layouts',
                active: true,
                header: 'Layouts',
                helpText: '',
                layoutSelector: true,
                showWidthHeightInputs: true,
                multipleLayouts: true,
                allowNewProjectFromLayout: true,
            });

            expect(defaultFormBuilder.variables).toEqual({
                type: 'variables',
                active: true,
                header: 'Customize',
                helpText: '',
            });
        });
    });
});
