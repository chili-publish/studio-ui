import { CustomDatePicker, useMobileSize } from '@chili-publish/grafx-shared-components';
import { IDateVariable } from './VariablesComponents.types';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import useDateVariable from './useDateVariable';

function DateVariable(props: IDateVariable) {
    const { handleValueChange, variable } = props;
    const { minDate, maxDate } = useDateVariable(variable);
    const ismobild = useMobileSize();

    console.log('%c⧭ ismobild', 'color: #86bf60', ismobild);
    return (
        <CustomDatePicker
            name={variable.name}
            label={variable.name}
            onChange={(date) => {
                if (date) {
                    handleValueChange(new Date(date).toISOString().split('T')[0]);
                } else {
                    handleValueChange('');
                }
            }}
            selected={variable.value ? new Date(variable.value) : null}
            dataId={getDataIdForSUI(`${variable.id}-variable-date-picker`)}
            dataTestId={getDataTestIdForSUI(`${variable.id}-variable-date-picker`)}
            placeholder="Select date"
            minDate={minDate}
            maxDate={maxDate}
            withPortal={ismobild}
        />
    );
}

export default DateVariable;
