import { useMemo } from 'react';
import { debounce } from '../utils/debounce-utils';

function useDebounce<F extends (...args: Parameters<F>) => ReturnType<F>>(fn: F, delay = 500) {
    const debouncedFunc = useMemo(() => {
        return debounce(fn, delay);
    }, [fn, delay]);

    return debouncedFunc;
}

export default useDebounce;
