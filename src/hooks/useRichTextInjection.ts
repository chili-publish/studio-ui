import { useCallback } from 'react';
import { useEnvironmentClientApi } from './useEnvironmentClientApi';
import { mapRichTextRulesToSdk } from 'src/utils/mapRichTextRulesToSdk';

export function useRichTextInjection() {
    const { richTextRules } = useEnvironmentClientApi();

    const injectRichTextRules = useCallback(async () => {
        try {
            const rules = await richTextRules.getAll();
            const ruleSets = rules.data ?? [];
            await window.StudioUISDK.variable.setRichTextRules(mapRichTextRulesToSdk(ruleSets));
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error loading rich text rules:', error);
        }
    }, [richTextRules]);

    return { injectRichTextRules };
}
