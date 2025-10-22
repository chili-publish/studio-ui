import { useCallback, useState } from 'react';
import { Button, ButtonVariant } from '@chili-publish/grafx-shared-components';
import { DateVariable as DateVariableType } from '@chili-publish/studio-sdk';
import { useUiConfigContext } from 'src/contexts/UiConfigContext';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import DateVariable from './DateVariable';
import { DatePickerWrapper, ButtonWrapper } from '../VariablesComponents.styles';

interface DateVariableMobileProps {
    variable: DateVariableType;
    onDateSelected: (_: DateVariableType) => void;
}
function DateVariableMobile({ variable, onDateSelected }: DateVariableMobileProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>();
    const { projectConfig } = useUiConfigContext();

    const handleDateSelection = useCallback(async () => {
        if (selectedDate) {
            const formattedDate = selectedDate?.toISOString().split('T')[0];
            const result = await window.StudioUISDK.variable.setValue(variable.id, formattedDate);
            if (result.success) {
                projectConfig.onVariableValueChangedCompleted?.(variable.id, formattedDate);
            }
            onDateSelected({ ...variable, value: formattedDate });
            setSelectedDate(null);
        }
    }, [selectedDate, onDateSelected, variable, projectConfig]);

    return (
        <>
            <DatePickerWrapper>
                <DateVariable
                    key={variable.id}
                    variable={variable as DateVariableType}
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
