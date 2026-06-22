import type { StructuredTextTextFlowDefinition } from '@chili-publish/studio-sdk';
import { internal } from '@chili-publish/environment-client-api';

export function mapRichTextRulesToSdk(ruleSets: internal.RichTextRuleInfo[]): StructuredTextTextFlowDefinition[] {
    return ruleSets.map((rule) => ({
        id: rule.id,
        styleRules: rule.styleRules ?? [],
    }));
}
