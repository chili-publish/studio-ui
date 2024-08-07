import { CustomDatePicker, InputLabel, useMobileSize } from '@chili-publish/grafx-shared-components';
import { useMemo } from 'react';
import { IDateVariable } from '../VariablesComponents.types';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import useDateVariable from '../useDateVariable';
import { HelpTextWrapper } from '../VariablesComponents.styles';
import { getVariablePlaceholder } from '../variablePlaceholder.util';

function DateVariable(props: IDateVariable) {
    const { handleValueChange, variable, onCalendarOpen, inline, selected, setDate, isOpenOnMobile } = props;
    const { minDate, maxDate } = useDateVariable(variable);
    const isMobileSize = useMobileSize();

    const getSelectedDate = useMemo(() => {
        if (isMobileSize && selected) return selected;
        if (variable.value) return new Date(variable.value);
        return null;
    }, [isMobileSize, selected, variable.value]);

    const placeholder = getVariablePlaceholder(variable);

    return (
        <HelpTextWrapper>
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
                placeholder={placeholder}
                minDate={minDate}
                maxDate={maxDate}
                onCalendarOpen={() => isMobileSize && onCalendarOpen?.()}
                inline={inline}
                excludedDays={variable.excludedDays}
            />
            {variable.helpText && !isOpenOnMobile ? (
                <InputLabel labelFor={variable.id} label={variable.helpText} />
            ) : null}
        </HelpTextWrapper>
    );
}

export default DateVariable;
