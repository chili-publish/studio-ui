import { InputLabel } from '@chili-publish/grafx-shared-components';
import { DateVariable as DateVariableType, Variable, VariableType } from '@chili-publish/studio-sdk';
import { ListVariable } from '@chili-publish/studio-sdk/lib/src/next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useVariableTranslations } from 'src/core/hooks/useVariableTranslations';
import { useSelector } from 'react-redux';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { PanelType } from '../../contexts/VariablePanelContext.types';
import DateVariableMobile from '../variablesComponents/dateVariable/DateVariableMobile';
import MobileListVariable from '../variablesComponents/listVariable/MobileListVariable';
import { isListVariable } from '../variablesComponents/Variable';
import VariablesComponents from '../variablesComponents/VariablesComponents';
import { HelpTextWrapper } from '../variablesComponents/VariablesComponents.styles';
import { ComponentWrapper, ListWrapper } from './VariablesPanel.styles';
import {
    selectCurrentPanel,
    showVariablesPanel,
    showDatePickerPanel,
    selectCurrentVariableId,
} from '../../store/reducers/panelReducer';
import { useAppDispatch } from '../../store';

interface VariablesListProps {
    variables: Variable[];
    onMobileOptionListToggle?: (_: boolean) => void;
}

function MobileVariablesList({ variables, onMobileOptionListToggle }: VariablesListProps) {
    const dispatch = useAppDispatch();

    const currentPanel = useSelector(selectCurrentPanel);
    const currentVariableId = useSelector(selectCurrentVariableId);

    const { validateUpdatedVariables } = useVariablePanelContext();
    const { variablesValidation, validateVariable } = useVariablePanelContext();

    const [listVariableOpen, setListVariableOpen] = useState<ListVariable | null>(null);
    const { updateWithTranslation } = useVariableTranslations();

    useEffect(() => {
        if (onMobileOptionListToggle) onMobileOptionListToggle(!!listVariableOpen);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listVariableOpen]);

    useEffect(() => {
        validateUpdatedVariables();
    }, [validateUpdatedVariables]);

    const handleDateSelected = useCallback(
        (variable: Variable) => {
            validateVariable(variable);
            dispatch(showVariablesPanel());
        },
        [dispatch, validateVariable],
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
                    currentPanel !== PanelType.DATE_VARIABLE_PICKER
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
                    currentPanel === PanelType.DATE_VARIABLE_PICKER &&
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
                return !listVariableOpen && currentPanel !== PanelType.DATE_VARIABLE_PICKER ? (
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
