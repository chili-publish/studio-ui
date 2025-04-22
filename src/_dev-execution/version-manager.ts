import Cookies from 'js-cookie';

interface EngineVerion {
    path: string;
    commitHash?: string;
}

export class EngineVersionManager {
    private readonly baseUrl = 'https://dev.devapi.chiligrafx-dev.com/version-management';

    private readonly CACHE_TTL = 60 * 60; // 1h (in seconds)

    private authToken: string;

    constructor(authToken: string) {
        this.authToken = authToken;
    }

    async getLatestCommitSha(branchPath: string): Promise<string | null> {
        const cachedData = Cookies.get(`${branchPath}-engineCommitSha`);

        if (cachedData) {
            return cachedData;
        }

        const commitSha = await this.fetchLatestCommitSha(branchPath);
        if (commitSha) {
            Cookies.set(`${branchPath}-engineCommitSha`, commitSha, { expires: this.CACHE_TTL });
        }

        return commitSha;
    }

    private async fetchLatestCommitSha(branchPath: string): Promise<string | null> {
        const selected = branchPath === 'main' ? 'latest' : branchPath;
        const data: Array<EngineVerion> = await fetch(`${this.baseUrl}/studio-engine`, {
            headers: {
                Authorization: `Bearer ${this.authToken}`,
                'Content-Type': 'application/json',
            },
        }).then((res) => res.json());
        return data.find((v) => v.path === selected)?.commitHash ?? null;
    }
}
