import { EditorResponse, NumberVariable } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Draft string for the number input, pending-submit tracking to skip duplicate onCommitValue calls
 * when the field re-fires with a formatted string before variable.value updates.
 * Remount or rely on variable.id when switching variables.
 */
export function useNumberVariableDraft(
    variable: NumberVariable,
    onValidateValue: (value: number) => void,
    onCommitValue: (value: number) => Promise<EditorResponse<null> | null>,
) {
    const [draft, setDraft] = useState(() => `${variable.value}`);
    const pendingRef = useRef(variable.value);

    useEffect(() => {
        setDraft(`${variable.value}`);
        pendingRef.current = variable.value;
    }, [variable.id, variable.value]);

    const revertToCommitted = useCallback(() => {
        setDraft(`${variable.value}`);
    }, [variable.id, variable.value]);

    const commitIfChanged = useCallback(
        async (raw: string) => {
            setDraft(raw);
            const num = Number(raw.replace(',', '.'));
            if (Number.isNaN(num)) {
                onValidateValue(num);
                return;
            }
            const committed = variable.value;
            if (num === committed) {
                onValidateValue(num);
                return;
            }
            if (num === pendingRef.current) {
                return;
            }
            pendingRef.current = num;
            onValidateValue(num);
            try {
                const result = await onCommitValue(num);
                if (result && !result.success) {
                    pendingRef.current = committed;
                    revertToCommitted();
                    onValidateValue(variable.value);
                }
            } catch {
                pendingRef.current = committed;
                revertToCommitted();
                onValidateValue(variable.value);
            }
        },
        [variable.id, variable.value, onValidateValue, onCommitValue, revertToCommitted],
    );

    const updateDraftWithoutCommit = useCallback(
        (raw: string, num: number) => {
            setDraft(raw);
            onValidateValue(num);
        },
        [onValidateValue],
    );

    // NumericField re-emits onValueChange with the same value once the formatted
    // draft flows back down as its `initVal` prop (its formatting effect reacts to
    // any initVal change). variable.value alone can't detect that echo because it
    // only catches up once the SDK commit round-trips, so callers must also check
    // pendingRef to tell a genuine new value from our own already-pending one.
    const isNewChange = useCallback(
        (num: number) => !Number.isNaN(num) && num !== variable.value && num !== pendingRef.current,
        [variable.value],
    );

    return { draft, commitIfChanged, updateDraftWithoutCommit, isNewChange } as const;
}
