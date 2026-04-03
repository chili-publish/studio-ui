import { DataSourceVariableDisplayOptionsType } from '@chili-publish/studio-sdk';
import { IDataSourceVariable } from '../VariablesComponents.types';
import DataSourceVariableTableMode from './DataSourceVariableTableMode';
import DataSourceVariableListMode from './DataSourceVariableListMode';

const DataSourceVariable = (props: IDataSourceVariable) => {
    const { variable, validationError, onValueChange } = props;

    const tableMode = variable.displayOptions?.type === DataSourceVariableDisplayOptionsType.table;
    const listMode = variable.displayOptions?.type === DataSourceVariableDisplayOptionsType.list;
    const dataSourceVariableProps = {
        validationError,
        onValueChange,
    };
    return (
        <>
            {tableMode ? <DataSourceVariableTableMode variable={variable} {...dataSourceVariableProps} /> : null}
            {listMode ? <DataSourceVariableListMode variable={variable} {...dataSourceVariableProps} /> : null}
        </>
    );
};

export default DataSourceVariable;
