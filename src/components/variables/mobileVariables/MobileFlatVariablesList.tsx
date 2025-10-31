import { InputLabel } from '@chili-publish/grafx-shared-components';
import { DateVariable as DateVariableType, ListVariable, Variable, VariableType } from '@chili-publish/studio-sdk';
import { useSelector } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import DateVariableMobile from '../../variablesComponents/dateVariable/DateVariableMobile';
import MobileListVariable from '../../variablesComponents/listVariable/MobileListVariable';
import { isListVariable } from '../../variablesComponents/Variable';
import VariablesComponents from '../../variablesComponents/VariablesComponents';
import { HelpTextWrapper } from '../../variablesComponents/VariablesComponents.styles';
import { ComponentWrapper } from '../VariablesPanel.styles';
import {
    showDatePickerPanel,
    PanelType,
    selectActivePanel,
    showVariablesPanel,
} from '../../../store/reducers/panelReducer';
import {
    selectCurrentVariableId,
    selectVariablesValidation,
    validateVariable,
} from '../../../store/reducers/variableReducer';
import { useAppDispatch } from '../../../store';

interface MobileFlatVariablesListProps {
    variables: Variable[];
    onMobileOptionListToggle?: (_: boolean) => void;
}
function MobileFlatVariablesList({ variables, onMobileOptionListToggle }: MobileFlatVariablesListProps) {
    const dispatch = useAppDispatch();
    const variablesValidation = useSelector(selectVariablesValidation);

    const activePanel = useSelector(selectActivePanel);
    const currentVariableId = useSelector(selectCurrentVariableId);

    const [listVariableOpen, setListVariableOpen] = useState<ListVariable | null>(null);

    useEffect(() => {
        if (onMobileOptionListToggle) onMobileOptionListToggle(!!listVariableOpen);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listVariableOpen]);

    const handleDateSelected = useCallback(
        (variable: Variable) => {
            dispatch(validateVariable(variable));
            dispatch(showVariablesPanel());
        },
        [dispatch],
    );

    return (
        <>
            {variables.map((variable: Variable) => {
                if (!variable.isVisible) return null;

                const errMsg = variablesValidation?.[variable.id]?.errorMsg;
                const isListVariabledDisplayed =
                    !listVariableOpen || (listVariableOpen && variable.id === listVariableOpen.id);

                if (
                    isListVariable(variable) &&
                    isListVariabledDisplayed &&
                    activePanel !== PanelType.DATE_VARIABLE_PICKER
                ) {
                    return (
                        <div
                            key={`variable-component-${variable.id}`}
                            data-intercom-target={`dropdown-variable-${variable.name}`}
                        >
                            <HelpTextWrapper>
                                <div>
                                    <MobileListVariable
                                        variable={variable}
                                        validationError={errMsg}
                                        onItemSelected={validateVariable}
                                        onMenuOpen={() => setListVariableOpen(variable as any)}
                                        onMenuClose={() => setListVariableOpen(null)}
                                    />
                                </div>
                                {variable.helpText && !listVariableOpen && !errMsg ? (
                                    <InputLabel labelFor={variable.id} label={variable.helpText} />
                                ) : null}
                            </HelpTextWrapper>
                        </div>
                    );
                }
                const isDateVariableOpen =
                    variable.type === VariableType.date &&
                    activePanel === PanelType.DATE_VARIABLE_PICKER &&
                    currentVariableId === variable.id;

                if (isDateVariableOpen && !listVariableOpen) {
                    return (
                        <DateVariableMobile
                            key={variable.id}
                            variable={variable as DateVariableType}
                            onDateSelected={handleDateSelected}
                        />
                    );
                }
                return !listVariableOpen && activePanel !== PanelType.DATE_VARIABLE_PICKER ? (
                    <ComponentWrapper key={`variable-component-${variable.id}`}>
                        <VariablesComponents
                            type={variable.type}
                            variable={variable}
                            onCalendarOpen={() => {
                                if (variable.type === VariableType.date)
                                    dispatch(showDatePickerPanel({ variableId: variable.id }));
                            }}
                        />
                    </ComponentWrapper>
                ) : null;
            })}
        </>
    );
}

export default MobileFlatVariablesList;
