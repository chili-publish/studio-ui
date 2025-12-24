import { StudioFeatureFlagsProvider, useStudioFeatureFlags } from '@chili-publish/grafx-shared-components';
import { DEFAULT_FEATURE_FLAGS_URL } from '../utils/constants';
import { getSUIVersion } from '../utils/getSUIVersion';

interface FeatureFlagProviderProps {
    featureFlagConfigURL?: string;
    children: React.ReactNode;
}

function FeatureFlagProvider({ featureFlagConfigURL, children }: FeatureFlagProviderProps) {
    const url = featureFlagConfigURL || DEFAULT_FEATURE_FLAGS_URL;
    const studioVersion = getSUIVersion();

    return (
        <StudioFeatureFlagsProvider featureFlagConfigURL={url} studioVersion={studioVersion}>
            {children}
        </StudioFeatureFlagsProvider>
    );
}

export const useFeatureFlagContext = useStudioFeatureFlags;

export default FeatureFlagProvider;
