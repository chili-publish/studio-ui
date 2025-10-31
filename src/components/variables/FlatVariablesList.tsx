import { DateVariable, Variable, VariableType } from '@chili-publish/studio-sdk';
import { useCallback } from 'react';
import { showDatePickerPanel } from 'src/store/reducers/panelReducer';
import { useAppDispatch } from 'src/store';
import VariablesComponents from '../variablesComponents/VariablesComponents';
import { ComponentWrapper } from './VariablesPanel.styles';

function FlatVariablesList({ variables }: { variables: Variable[] }) {
    const dispatch = useAppDispatch();
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
                return (
                    <ComponentWrapper key={`variable-component-${variable.id}`}>
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
}

export default FlatVariablesList;
