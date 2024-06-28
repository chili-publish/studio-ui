import { CustomDatePicker, useMobileSize } from '@chili-publish/grafx-shared-components';
import { useMemo } from 'react';
import { IDateVariable } from './VariablesComponents.types';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import useDateVariable from './useDateVariable';

function DateVariable(props: IDateVariable) {
    const { handleValueChange, variable, onCalendarOpen, inline, selected, setDate } = props;
    const { minDate, maxDate } = useDateVariable(variable);
    const isMobileSize = useMobileSize();

    const getSelectedDate = useMemo(() => {
        if (isMobileSize && selected) return selected;
        if (variable.value) return new Date(variable.value);
        return null;
    }, [isMobileSize, selected, variable.value]);
    return (
        <CustomDatePicker
            name={variable.name}
            label={isMobileSize ? '' : variable.name}
            onChange={(date) => {
                if (date) {
                    handleValueChange?.(new Date(date).toISOString().split('T')[0]);
                    setDate?.(new Date(date).toISOString().split('T')[0]);
                } else {
                    handleValueChange?.('');
                }
            }}
            selected={getSelectedDate}
            dataId={getDataIdForSUI(`${variable.id}-variable-date-picker`)}
            dataTestId={getDataTestIdForSUI(`${variable.id}-variable-date-picker`)}
            placeholder="Select date"
            minDate={minDate}
            maxDate={maxDate}
            onCalendarOpen={() => isMobileSize && onCalendarOpen?.()}
            inline={inline}
        />
    );
}

export default DateVariable;
