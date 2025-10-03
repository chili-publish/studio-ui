export interface TemplateDocument {
    [key: string]: unknown;
}

export class TemplateManager {
    private readonly authToken: string;

    private readonly environmentApiBaseUrl: string;

    private readonly templateId: string;

    constructor(authToken: string, environmentApiBaseUrl: string, templateId: string) {
        this.authToken = authToken;
        this.environmentApiBaseUrl = environmentApiBaseUrl;
        this.templateId = templateId;
    }

    /**
     * Fetches template document from the environment API and returns it as JSON string
     */
    async getTemplateDocumentAsString(): Promise<TemplateDocument> {
        const response = await fetch(`${this.environmentApiBaseUrl}/templates/${this.templateId}/download`, {
            headers: { Authorization: `Bearer ${this.authToken}` },
        });
        return response.json();
    }
}
