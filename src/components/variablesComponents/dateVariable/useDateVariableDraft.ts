import { DateVariable, EditorResponse } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Draft ISO string for the date picker, pending-submit tracking to skip duplicate onCommitValue calls
 * if the picker fires again with the same value before variable.value updates.
 * When onCommitValue is omitted (e.g. mobile inline picker), commitIfChanged is a no-op.
 */
export function useDateVariableDraft(
    variable: DateVariable,
    onValidateValue: ((isoDate: string) => void) | undefined,
    onCommitValue: ((isoDate: string) => Promise<EditorResponse<null> | null>) | undefined,
) {
    const [draft, setDraft] = useState(() => variable.value ?? '');
    const pendingRef = useRef(variable.value ?? '');

    useEffect(() => {
        const committed = variable.value ?? '';
        setDraft(committed);
        pendingRef.current = committed;
    }, [variable.id, variable.value]);

    const revertToCommitted = useCallback(() => {
        setDraft(variable.value ?? '');
    }, [variable.id, variable.value]);

    const commitIfChanged = useCallback(
        async (isoDate: string) => {
            if (!onCommitValue) return;
            setDraft(isoDate);
            const committed = variable.value ?? '';
            if (committed === isoDate) {
                onValidateValue?.(isoDate);
                return;
            }
            if (isoDate === pendingRef.current) {
                return;
            }
            pendingRef.current = isoDate;
            onValidateValue?.(isoDate);
            try {
                const result = await onCommitValue(isoDate);
                if (result && !result.success) {
                    pendingRef.current = committed;
                    revertToCommitted();
                    onValidateValue?.(variable.value ?? '');
                }
            } catch {
                pendingRef.current = committed;
                revertToCommitted();
                onValidateValue?.(variable.value ?? '');
            }
        },
        [variable.id, variable.value, onValidateValue, onCommitValue, revertToCommitted],
    );

    return { draft, commitIfChanged } as const;
}
