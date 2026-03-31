import { DateVariable, Variable } from '@chili-publish/studio-sdk';
import { useMemo } from 'react';

const useDateVariable = (currentVariable?: Variable) => {
    const getMinDate = useMemo(() => {
        if ((currentVariable as DateVariable)?.startDate) {
            const { startDate } = currentVariable as DateVariable;
            let minDate: Date = new Date();
            switch (startDate?.type) {
                case 'relative': {
                    minDate = new Date(minDate.setDate(minDate.getDate() + startDate.offset));
                    break;
                }
                case 'absolute': {
                    minDate = new Date(startDate.value);
                    break;
                }
                default:
                    return undefined;
            }
            return minDate;
        }
        return undefined;
    }, [currentVariable]);

    const getMaxDate = useMemo(() => {
        if ((currentVariable as DateVariable)?.endDate) {
            const { endDate } = currentVariable as DateVariable;
            let maxDate: Date = new Date();
            switch (endDate?.type) {
                case 'relative': {
                    maxDate = new Date(maxDate.setDate(maxDate.getDate() + endDate.offset));
                    break;
                }
                case 'absolute': {
                    maxDate = new Date(endDate.value);
                    break;
                }
                default:
                    return undefined;
            }
            return maxDate;
        }
        return undefined;
    }, [currentVariable]);
    return {
        minDate: getMinDate,
        maxDate: getMaxDate,
    };
};

export default useDateVariable;
