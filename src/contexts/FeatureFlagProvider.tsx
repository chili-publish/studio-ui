import { StudioFeatureFlagsProvider, useStudioFeatureFlags } from '@chili-publish/grafx-shared-components';
import { DEFAULT_FEATURE_FLAGS_URL } from '../utils/constants';
import { getSUIVersion } from '../utils/getSUIVersion';

const STUDIO_VERSION = getSUIVersion();

interface FeatureFlagProviderProps {
    featureFlagConfigURL?: string;
    children: React.ReactNode;
}

function FeatureFlagProvider({ featureFlagConfigURL, children }: FeatureFlagProviderProps) {
    const url = featureFlagConfigURL || DEFAULT_FEATURE_FLAGS_URL;

    return (
        <StudioFeatureFlagsProvider featureFlagConfigURL={url} studioVersion={STUDIO_VERSION}>
            {children}
        </StudioFeatureFlagsProvider>
    );
}

export const useFeatureFlagContext = useStudioFeatureFlags;

export default FeatureFlagProvider;
