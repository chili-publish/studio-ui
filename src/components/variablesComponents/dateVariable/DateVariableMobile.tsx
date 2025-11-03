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

function DateVariableMobile() {
    const dispatch = useAppDispatch();
    const currentVariable = useSelector(selectCurrentVariable);
    const [selectedDate, setSelectedDate] = useState<Date | null>();
    const { projectConfig } = useUiConfigContext();

    const handleDateSelection = useCallback(async () => {
        if (selectedDate && currentVariable) {
            const formattedDate = selectedDate?.toISOString().split('T')[0];
            const result = await window.StudioUISDK.variable.setValue(currentVariable.id, formattedDate);
            if (result.success) {
                projectConfig.onVariableValueChangedCompleted?.(currentVariable.id, formattedDate);
            }
            dispatch(validateVariable(currentVariable));
            dispatch(showVariablesPanel());

            setSelectedDate(null);
        }
    }, [selectedDate, currentVariable, projectConfig]);

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
}

export default DateVariableMobile;
