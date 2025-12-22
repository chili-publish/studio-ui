import packageInfo from '../../package.json';

/**
 * Get the studio UI version from package.json
 * Since WRS and SDK versions are aligned, we use this for feature flag version checks
 */
export function getSUIVersion(): string {
    const fullVersion = packageInfo.version;
    // Remove any pre-release suffix (e.g., "-alpha.1") and extract major.minor
    const cleanVersion = fullVersion.split('-')[0];
    const parts = cleanVersion.split('.');
    return parts.slice(0, 2).join('.');
}
