import { DateVariable, Variable, VariableType } from '@chili-publish/studio-sdk';
import { useCallback } from 'react';
import { showDatePickerPanel } from 'src/store/reducers/panelReducer';
import { useAppDispatch, useAppSelector } from 'src/store';
import { getDataIdForSUI, getDataTestIdForSUI } from 'src/utils/dataIds';
import VariablesComponents from '../variablesComponents/VariablesComponents';
import { ComponentWrapper } from './VariablesPanel.styles';

const FlatVariablesList = ({ variables }: { variables: Variable[] }) => {
    const dispatch = useAppDispatch();
    const documentLoadGeneration = useAppSelector((state) => state.document.loadGeneration);
    const handleCalendarOpen = useCallback(
        (variable: DateVariable) => {
            if (variable.type === VariableType.date) dispatch(showDatePickerPanel({ variableId: variable.id }));
        },
        [dispatch],
    );
    return (
        <>
            {variables.map((variable: Variable) => {
                if (!variable.isVisible) return null;
                const key =
                    variable.type === VariableType.image
                        ? `variable-component-${variable.id}-${documentLoadGeneration}`
                        : `variable-component-${variable.id}`;
                return (
                    <ComponentWrapper
                        key={key}
                        data-id={getDataIdForSUI(`variable-component-${variable.id}`)}
                        data-testid={getDataTestIdForSUI(`variable-component-${variable.id}`)}
                    >
                        <VariablesComponents
                            type={variable.type}
                            variable={variable}
                            onCalendarOpen={handleCalendarOpen}
                        />
                    </ComponentWrapper>
                );
            })}
        </>
    );
};

export default FlatVariablesList;
