import Cookies from 'js-cookie';

interface EngineVerion {
    name: string;
    successCommitHash: string;
}

export class EngineVersionManager {
    private readonly baseUrl = 'https://dev.devapi.chiligrafx-dev.com/version-management';

    private readonly CACHE_TTL = 60 * 60; // 1h (in seconds)

    private authToken: string;

    constructor(authToken: string) {
        this.authToken = authToken;
    }

    async getLatestCommitSha(): Promise<string | null> {
        const cachedData = Cookies.get('engineCommitSha');

        if (cachedData) {
            return cachedData;
        }

        const commitSha = await this.fetchLatestCommitSha();
        if (commitSha) {
            Cookies.set('engineCommitSha', commitSha, { expires: this.CACHE_TTL });
        }

        return commitSha;
    }

    // Method to update the auth token if it changes
    updateAuthToken(newToken: string): void {
        this.authToken = newToken;
    }

    private async fetchLatestCommitSha(): Promise<string | null> {
        const data: Array<EngineVerion> = await fetch(`${this.baseUrl}/studio-engine`, {
            headers: {
                Authorization: `Bearer ${this.authToken}`,
                'Content-Type': 'application/json',
            },
        }).then((res) => res.json());
        return data.find((v) => v.name === 'latest')?.successCommitHash ?? null;
    }
}
