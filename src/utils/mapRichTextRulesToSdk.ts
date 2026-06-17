import type { StructuredTextTextFlowDefinition } from '@chili-publish/studio-sdk';
import { RichTextRuleInfo } from '@chili-publish/environment-client-api/dist/internal/types/models/RichTextRuleInfo';

export function mapRichTextRulesToSdk(ruleSets: RichTextRuleInfo[]): StructuredTextTextFlowDefinition[] {
    return ruleSets.map((rule) => ({
        id: rule.id,
        styleRules: rule.styleRules ?? [],
    }));
}
