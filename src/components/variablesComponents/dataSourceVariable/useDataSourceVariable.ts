import { ConnectorDataSourceVariableSource, DataSourceVariable } from '@chili-publish/studio-sdk';
import useSharedDataSource from 'src/components/shared/DataSource/useSharedDataSource';

interface IUseDataSourceVariable {
    variable: DataSourceVariable;
}
const useDataSourceVariable = (props: IUseDataSourceVariable) => {
    const { variable } = props;
    const connectorId = (variable.value as ConnectorDataSourceVariableSource)?.connectorId;
    const {
        updateSelectedRow,
        dataRows,

        isPrevDisabled,
        isNextDisabled,

        isNextPageLoading,
        isPreviousPageLoading,

        hasPreviousPage,
        hasNextPage,

        getPreviousRow,
        getNextRow,

        ...sharedDataSourceProps
    } = useSharedDataSource({ connectorId });

    return {
        updateSelectedRow,
        dataRows,

        isPrevDisabled,
        isNextDisabled,

        isNextPageLoading,
        isPreviousPageLoading,

        hasPreviousPage,
        hasNextPage,

        getPreviousRow,
        getNextRow,

        ...sharedDataSourceProps,
    };
};

export default useDataSourceVariable;
