import { useCallback, useState } from 'react';
import { Button, ButtonVariant } from '@chili-publish/grafx-shared-components';
import { DateVariable as DateVariableType, VariableType } from '@chili-publish/studio-sdk';
import { useUiConfigContext } from 'src/contexts/UiConfigContext';
import { selectCurrentVariable, validateVariable } from 'src/store/reducers/variableReducer';
import { showVariablesPanel } from 'src/store/reducers/panelReducer';
import { useSelector } from 'react-redux';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import DateVariable from './DateVariable';
import { DatePickerWrapper, ButtonWrapper } from '../VariablesComponents.styles';
import { useAppDispatch } from '../../../store';

const DateVariableMobile = () => {
    const dispatch = useAppDispatch();
    const currentVariable = useSelector(selectCurrentVariable);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const { projectConfig } = useUiConfigContext();

    const handleDateSelection = useCallback(async () => {
        if (!selectedDate || !currentVariable) return;
        const isoDate = selectedDate.toISOString().split('T')[0];
        try {
            const result = await window.StudioUISDK.variable.setValue(currentVariable.id, isoDate);
            if (!result.success) {
                throw new Error('setValue failed');
            }
            projectConfig.onVariableValueChangedCompleted?.(currentVariable.id, isoDate);
            dispatch(validateVariable(currentVariable));
            dispatch(showVariablesPanel());
            setSelectedDate(null);
        } catch {
            const dateVar = currentVariable as DateVariableType;
            setSelectedDate(dateVar.value ? new Date(dateVar.value) : null);
            dispatch(validateVariable(currentVariable));
        }
    }, [selectedDate, currentVariable, projectConfig, dispatch]);

    if (!currentVariable || currentVariable?.type !== VariableType.date) return null;
    return (
        <>
            <DatePickerWrapper>
                <DateVariable
                    key={currentVariable.id}
                    variable={currentVariable as DateVariableType}
                    inline
                    selected={selectedDate}
                    setDate={(val) => {
                        setSelectedDate(new Date(val));
                    }}
                    isOpenOnMobile
                />
            </DatePickerWrapper>
            <ButtonWrapper>
                <Button
                    dataId={getDataIdForSUI(`date-confirm-btn`)}
                    dataTestId={getDataTestIdForSUI(`date-confirm-btn`)}
                    onClick={handleDateSelection}
                    variant={ButtonVariant.primary}
                    label="Confirm"
                />
            </ButtonWrapper>
        </>
    );
};

export default DateVariableMobile;
