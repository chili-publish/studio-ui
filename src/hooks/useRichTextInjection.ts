import { useCallback } from 'react';
import { useEnvironmentClientApi } from './useEnvironmentClientApi';
import { mapRichTextRulesToSdk } from 'src/utils/mapRichTextRulesToSdk';
import { useFeatureFlagContext } from 'src/contexts/FeatureFlagProvider';

export function useRichTextInjection() {
    const { richTextRules } = useEnvironmentClientApi();
    const { isEnabled } = useFeatureFlagContext();

    const injectRichTextRules = useCallback(async () => {
        if (!isEnabled('richTextRulesInjection')) return;
        const rules = await richTextRules.getAll();
        const ruleSets = rules.data ?? [];
        await window.StudioUISDK.variable.setRichTextRules(mapRichTextRulesToSdk(ruleSets));
    }, [richTextRules, isEnabled]);

    return { injectRichTextRules };
}
