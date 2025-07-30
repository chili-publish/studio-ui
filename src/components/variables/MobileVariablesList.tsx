import { InputLabel } from '@chili-publish/grafx-shared-components';
import { DateVariable as DateVariableType, Variable, VariableType } from '@chili-publish/studio-sdk';
import { ListVariable } from '@chili-publish/studio-sdk/lib/src/next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useVariableTranslations } from '../../core/hooks/useVariableTranslations';
import DateVariableMobile from '../variablesComponents/dateVariable/DateVariableMobile';
import MobileListVariable from '../variablesComponents/listVariable/MobileListVariable';
import { isListVariable } from '../variablesComponents/Variable';
import VariablesComponents from '../variablesComponents/VariablesComponents';
import { HelpTextWrapper } from '../variablesComponents/VariablesComponents.styles';
import { ComponentWrapper, ListWrapper } from './VariablesPanel.styles';
import {
    selectActivePanel,
    showVariablesPanel,
    showDatePickerPanel,
    PanelType,
} from '../../store/reducers/panelReducer';
import { useAppDispatch } from '../../store';
import {
    selectCurrentVariableId,
    selectVariables,
    selectVariablesValidation,
    validateUpdatedVariables,
    validateVariable,
} from '../../store/reducers/variableReducer';
import { useVariableHistory } from '../dataSource/useVariableHistory';

interface VariablesListProps {
    onMobileOptionListToggle?: (_: boolean) => void;
}

function MobileVariablesList({ onMobileOptionListToggle }: VariablesListProps) {
    const dispatch = useAppDispatch();
    const variables = useSelector(selectVariables);
    const variablesValidation = useSelector(selectVariablesValidation);

    const activePanel = useSelector(selectActivePanel);
    const currentVariableId = useSelector(selectCurrentVariableId);

    const [listVariableOpen, setListVariableOpen] = useState<ListVariable | null>(null);
    const { updateWithTranslation } = useVariableTranslations();
    const { hasChanged: variablesChanged } = useVariableHistory();

    useEffect(() => {
        if (onMobileOptionListToggle) onMobileOptionListToggle(!!listVariableOpen);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listVariableOpen]);

    useEffect(() => {
        if (variablesChanged) dispatch(validateUpdatedVariables());
    }, [variablesChanged, dispatch]);

    const handleDateSelected = useCallback(
        (variable: Variable) => {
            dispatch(validateVariable(variable));
            dispatch(showVariablesPanel());
        },
        [dispatch],
    );

    const variablesWithTranslation = useMemo(() => {
        return variables.map((variable) => updateWithTranslation(variable));
    }, [variables, updateWithTranslation]);

    return (
        <ListWrapper optionsListOpen={!!listVariableOpen}>
            {variablesWithTranslation.map((variable: Variable) => {
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
                        <ComponentWrapper
                            key={`variable-component-${variable.id}`}
                            data-intercom-target={`dropdown-variable-${variable.name}`}
                        >
                            <HelpTextWrapper>
                                <div>
                                    <MobileListVariable
                                        variable={variable}
                                        validationError={errMsg}
                                        onItemSelected={validateVariable}
                                        onMenuOpen={() => setListVariableOpen(variable)}
                                        onMenuClose={() => setListVariableOpen(null)}
                                    />
                                </div>
                                {variable.helpText && !listVariableOpen && !errMsg ? (
                                    <InputLabel labelFor={variable.id} label={variable.helpText} />
                                ) : null}
                            </HelpTextWrapper>
                        </ComponentWrapper>
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
        </ListWrapper>
    );
}

export default MobileVariablesList;
