import { useCallback, useState } from 'react';
import { Button, ButtonVariant } from '@chili-publish/grafx-shared-components';
import { css } from 'styled-components';
import { DateVariable as DateVariableType } from '@chili-publish/studio-sdk';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import DateVariable from './DateVariable';
import { DatePickerWrapper } from '../VariablesComponents.styles';

interface DateVariableMobileProps {
    variable: DateVariableType;
    onDateSelected: () => void;
}
function DateVariableMobile({ variable, onDateSelected }: DateVariableMobileProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>();

    const handleDateSelection = useCallback(async () => {
        if (selectedDate) {
            await window.SDK.variable.setValue(variable.id, selectedDate?.toISOString().split('T')[0]);
            onDateSelected();
            setSelectedDate(null);
        }
    }, [selectedDate, onDateSelected, variable.id]);

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
            <Button
                dataId={getDataIdForSUI(`date-confirm-btn`)}
                dataTestId={getDataTestIdForSUI(`date-confirm-btn`)}
                onClick={handleDateSelection}
                variant={ButtonVariant.primary}
                label="Confirm"
                styles={css`
                    width: 100%;
                `}
            />
        </>
    );
}

export default DateVariableMobile;
