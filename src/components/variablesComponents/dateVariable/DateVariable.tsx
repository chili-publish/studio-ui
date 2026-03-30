import { DatePicker, InputLabel, useMobileSize } from '@chili-publish/grafx-shared-components';
import { useMemo } from 'react';
import { APP_WRAPPER_ID } from '../../../utils/constants';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import useDateVariable from './useDateVariable';
import { getVariablePlaceholder } from '../variablePlaceholder.util';
import { HelpTextWrapper } from '../VariablesComponents.styles';
import { IDateVariable } from '../VariablesComponents.types';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';
import { useDateVariableDraft } from './useDateVariableDraft';

/** ISO 8601 calendar date string (YYYY-MM-DD) for SDK / variable storage. */
function toISODateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const DateVariable = (props: IDateVariable) => {
    const {
        onValidateValue,
        onCommitValue,
        variable,
        onCalendarOpen,
        inline,
        selected,
        setDate,
        isOpenOnMobile,
        validationError,
        onBlur,
    } = props;

    const { onVariableBlur, onVariableFocus } = useUiConfigContext();

    const { minDate, maxDate } = useDateVariable(variable);
    const isMobileSize = useMobileSize();

    const { draft, commitIfChanged } = useDateVariableDraft(variable, onValidateValue, onCommitValue);

    const getSelectedDate = useMemo(() => {
        if (isMobileSize && selected) return selected;
        if (onCommitValue) return draft ? new Date(draft) : null;
        if (variable.value) return new Date(variable.value);
        return null;
    }, [isMobileSize, selected, variable.value, onCommitValue, draft]);

    const placeholder = getVariablePlaceholder(variable);

    const handleChange = (date: Date | null | undefined) => {
        if (date) {
            const isoDate = toISODateString(date);
            if (!onCommitValue) {
                setDate?.(isoDate);
                return;
            }
            commitIfChanged(isoDate);
        } else if (onCommitValue) {
            commitIfChanged('');
        }
    };

    const variableLabel = useMemo(() => {
        if (isOpenOnMobile) return '';
        return variable.label ?? variable.name;
    }, [isOpenOnMobile, variable.label, variable.name]);

    return (
        <HelpTextWrapper>
            <DatePicker
                anchorId={APP_WRAPPER_ID}
                name={variable.name}
                label={variableLabel}
                required={variable.isRequired}
                onChange={handleChange}
                onBlur={() => {
                    const selectedDate = getSelectedDate;
                    onBlur?.(selectedDate ? toISODateString(selectedDate) : '');
                    onVariableBlur?.(variable.id);
                }}
                selected={getSelectedDate}
                dataId={getDataIdForSUI(`${variable.id}-variable-date-picker`)}
                dataTestId={getDataTestIdForSUI(`${variable.id}-variable-date-picker`)}
                placeholder={placeholder}
                minDate={minDate}
                maxDate={maxDate}
                onCalendarOpen={() => {
                    onVariableFocus?.(variable.id);
                    if (isMobileSize) onCalendarOpen?.(variable);
                }}
                inline={inline}
                excludedDays={variable.excludedDays}
                validationErrorMessage={validationError}
            />
            {variable.helpText && !isOpenOnMobile && !validationError ? (
                <InputLabel labelFor={variable.id} label={variable.helpText} />
            ) : null}
        </HelpTextWrapper>
    );
};

export default DateVariable;
