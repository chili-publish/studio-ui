import { DatePicker, InputLabel, useMobileSize } from '@chili-publish/grafx-shared-components';
import { useMemo } from 'react';
import { IDateVariable } from '../VariablesComponents.types';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import useDateVariable from '../useDateVariable';
import { HelpTextWrapper } from '../VariablesComponents.styles';
import { getVariablePlaceholder } from '../variablePlaceholder.util';
import { APP_WRAPPER_ID } from '../../../utils/constants';

function DateVariable(props: IDateVariable) {
    const {
        onValueChange,
        variable,
        onCalendarOpen,
        inline,
        selected,
        setDate,
        isOpenOnMobile,
        validationError,
        onBlur,
    } = props;
    const { minDate, maxDate } = useDateVariable(variable);
    const isMobileSize = useMobileSize();

    const getSelectedDate = useMemo(() => {
        if (isMobileSize && selected) return selected;
        if (variable.value) return new Date(variable.value);
        return null;
    }, [isMobileSize, selected, variable.value]);

    const placeholder = getVariablePlaceholder(variable);

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <HelpTextWrapper>
            <DatePicker
                anchorId={APP_WRAPPER_ID}
                name={variable.name}
                label={isOpenOnMobile ? '' : variable.name}
                required={variable.isRequired}
                onChange={(date) => {
                    if (date) {
                        const formattedDate = formatDate(date);
                        onValueChange?.(formattedDate, { changed: true });
                        if (setDate) {
                            setDate(formattedDate);
                        }
                    } else {
                        onValueChange?.('', { changed: true });
                    }
                }}
                onBlur={() => {
                    const selectedDate = getSelectedDate;
                    onBlur?.(selectedDate ? formatDate(selectedDate) : '');
                }}
                selected={getSelectedDate}
                dataId={getDataIdForSUI(`${variable.id}-variable-date-picker`)}
                dataTestId={getDataTestIdForSUI(`${variable.id}-variable-date-picker`)}
                placeholder={placeholder}
                minDate={minDate}
                maxDate={maxDate}
                onCalendarOpen={() => isMobileSize && onCalendarOpen?.(variable)}
                inline={inline}
                excludedDays={variable.excludedDays}
                validationErrorMessage={validationError}
            />
            {variable.helpText && !isOpenOnMobile && !validationError ? (
                <InputLabel labelFor={variable.id} label={variable.helpText} />
            ) : null}
        </HelpTextWrapper>
    );
}

export default DateVariable;
