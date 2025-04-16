import { LayoutForm, DataSourceForm, VariablesForm, FormBuilderArray, FormBuilderType } from 'src/types/types';

export const transformFormBuilderArrayToObject = (formBuilderArray?: FormBuilderArray): FormBuilderType => {
    if (!formBuilderArray || !formBuilderArray.length)
        return { datasource: undefined, layouts: undefined, variables: undefined } as unknown as FormBuilderType;
    return formBuilderArray.reduce(
        (acc: Record<string, LayoutForm | DataSourceForm | VariablesForm | undefined>, curr) => {
            return { ...acc, [curr.type]: curr };
        },
        {
            datasource: undefined,
            layouts: undefined,
            variables: undefined,
        },
    ) as FormBuilderType;
};
