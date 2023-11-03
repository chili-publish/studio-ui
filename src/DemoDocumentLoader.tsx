import axios from 'axios';
import { DownloadLinkResult, Project } from './types/types';

export class DemoDocumentLoader {
    editorLink: string;

    onProjectInfoRequested: (projectId: string) => Promise<Project>;

    onProjectDocumentRequested: (projectId: string) => Promise<string>;

    onProjectLoaded: (project: Project) => void;

    onProjectSave: () => Promise<Project>;

    onAuthenticationRequested: () => string;

    onAuthenticationExpired: () => Promise<string>;

    onLogInfoRequested: () => unknown;

    onProjectGetDownloadLink: (extension: string, selectedLayoutID: string | undefined) => Promise<DownloadLinkResult>;

    demoId: string;

    /**
     *
     */
    constructor(editorLink: string) {
        this.editorLink = editorLink;
        this.demoId = '21d8c0e0-0b0e-4e1e-8b0a-0b0e4e1e8b0a';
        this.onProjectInfoRequested = async (): Promise<Project> => {
            return {
                id: this.demoId,
                name: 'Demo',
                template: {
                    id: this.demoId,
                },
            };
        };
        this.onProjectDocumentRequested = async (): Promise<string> => {
            return axios.get(`${editorLink}/assets/assets/documents/demo.json`).then((res) => {
                return JSON.stringify(res.data);
            });
        };
        this.onAuthenticationExpired = async (): Promise<string> => {
            return '';
        };
        this.onAuthenticationRequested = (): string => {
            return '';
        };
        this.onProjectLoaded = (): void => {
            // ignored
        };
        this.onProjectSave = async (): Promise<Project> => {
            return { id: this.demoId, name: 'Demo', template: { id: this.demoId } };
        };
        this.onLogInfoRequested = (): unknown => {
            return { demo: true, editorLink };
        };
        this.onProjectGetDownloadLink = () => {
            return Promise.resolve({
                status: 200,
                error: undefined,
                success: true,
                parsedData: undefined,
                data: undefined,
            });
        };
    }
}
