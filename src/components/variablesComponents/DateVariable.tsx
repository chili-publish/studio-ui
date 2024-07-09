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
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    handleValueChange?.(`${year}-${month}-${day}`);
                    if (setDate) {
                        setDate(`${year}-${month}-${day}`);
                    }
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
            useLocale
        />
    );
}

export default DateVariable;
