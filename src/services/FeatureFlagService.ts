import { fetchFeatureFlags } from '@chili-publish/grafx-shared-components';
import packageInfo from '../../package.json';
import { FeatureFlagsType } from '../types/types';

// Since Studio UI and SDK versions are aligned, we can get the version from the package.json
function getStudioVersion(): string {
    const fullVersion = packageInfo.version;
    // Remove any pre-release suffix (e.g., "-alpha.1") and extract major.minor
    const cleanVersion = fullVersion.split('-')[0];
    const parts = cleanVersion.split('.');
    return parts.slice(0, 2).join('.');
}

// Pre-computed version at module load time
const STUDIO_VERSION = getStudioVersion();

/**
 * Centralized Feature Flag Service
 *
 * This service fetches feature flags from a configurable URL and determines
 * which features should be enabled based on the version.
 */
class FeatureFlagService {
    private static instance: FeatureFlagService;

    private featureFlags: FeatureFlagsType = {};

    private isInitialized = false;

    private initPromise: Promise<void> | null = null;

    private configURL = '';

    private studioVersion: string = STUDIO_VERSION;

    static getInstance(): FeatureFlagService {
        if (!FeatureFlagService.instance) {
            FeatureFlagService.instance = new FeatureFlagService();
        }
        return FeatureFlagService.instance;
    }

    /**
     * Configure the feature flag service with the URL to fetch flags from
     * Must be called before initialize()
     */
    configure(featureFlagConfigURL: string): void {
        this.configURL = featureFlagConfigURL;
    }

    /**
     * Initialize the feature flag service by fetching flags
     * @param onFlagsReady - Optional callback called with fetched flags (for Redux dispatch or context)
     */
    async initialize(onFlagsReady?: (flags: FeatureFlagsType) => void): Promise<void> {
        // If already initialized, call callback and return
        if (this.isInitialized) {
            onFlagsReady?.(this.featureFlags);
            return;
        }

        // If initialization is in progress, wait for it
        if (this.initPromise) {
            await this.initPromise;
            onFlagsReady?.(this.featureFlags);
            return;
        }

        this.initPromise = this.fetchAndProcessFlags();
        await this.initPromise;
        onFlagsReady?.(this.featureFlags);
    }

    private async fetchAndProcessFlags(): Promise<void> {
        try {
            // Use shared fetchFeatureFlags from grafx-shared-components
            // It handles version-based filtering internally
            this.featureFlags = await fetchFeatureFlags(this.configURL, this.studioVersion);
            this.isInitialized = true;
        } catch (error) {
            // If fetching fails, log error and default to all flags disabled
            // This ensures features are hidden if we can't verify them
            // eslint-disable-next-line no-console
            console.error('Failed to fetch feature flags:', error);
            this.featureFlags = {};
            this.isInitialized = true;
        }
    }

    /**
     * Check if a specific feature flag is enabled
     */
    isEnabled(flagName: string): boolean {
        if (!this.isInitialized) {
            // Not initialized yet, default to disabled
            return false;
        }
        return !!this.featureFlags[flagName];
    }

    /**
     * Get all current feature flags
     */
    getFeatureFlags(): FeatureFlagsType {
        return { ...this.featureFlags };
    }
}

export const featureFlagService = FeatureFlagService.getInstance();
export default FeatureFlagService;
