import { DataSourceVariableDisplayOptionsType } from '@chili-publish/studio-sdk';
import { IDataSourceVariable } from '../VariablesComponents.types';
import DataSourceVariableTableMode from './DataSourceTableMode';
import DataSourceVariableListMode from './DataSourceListMode';

const DataSourceVariable = (props: IDataSourceVariable) => {
    const { variable, validationError, onValueChange } = props;

    const tableMode = variable.displayOptions?.type === DataSourceVariableDisplayOptionsType.table;
    const listMode = variable.displayOptions?.type === DataSourceVariableDisplayOptionsType.list;

    return (
        <>
            {tableMode ? (
                <DataSourceVariableTableMode
                    variable={variable}
                    validationError={validationError}
                    onValueChange={onValueChange}
                />
            ) : null}
            {listMode ? (
                <DataSourceVariableListMode
                    variable={variable}
                    validationError={validationError}
                    onValueChange={onValueChange}
                />
            ) : null}
        </>
    );
};

export default DataSourceVariable;
