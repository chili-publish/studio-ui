import { useCallback, useEffect, useState } from 'react';

/**
 * Local draft string synced from committed value when id or committed changes.
 * For date variables, `committed` / `draft` are ISO 8601 date strings (YYYY-MM-DD); use
 * `selected={draft ? new Date(draft) : null}` when driving the picker from draft.
 */
export function useValueDraft(variableId: string, committed: string) {
    const [draft, setDraft] = useState(committed);

    useEffect(() => {
        setDraft(committed);
    }, [variableId, committed]);

    const revertToCommitted = useCallback(() => {
        setDraft(committed);
    }, [committed]);

    return [draft, setDraft, revertToCommitted] as const;
}
