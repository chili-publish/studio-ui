import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FeatureFlagsType } from '../types/types';
import { featureFlagService } from '../services/FeatureFlagService';

interface IFeatureFlagContext {
    featureFlags: FeatureFlagsType;
    isEnabled: (flagName: string) => boolean;
    isLoading: boolean;
}

export const FeatureFlagContextDefaultValues: IFeatureFlagContext = {
    featureFlags: {},
    isEnabled: () => false,
    isLoading: true,
};

export const FeatureFlagContext = createContext<IFeatureFlagContext>(FeatureFlagContextDefaultValues);

export const useFeatureFlagContext = () => {
    return useContext(FeatureFlagContext);
};

interface FeatureFlagProviderProps {
    /** URL to fetch feature flags from. If not provided, no feature flags are enabled. */
    featureFlagConfigURL?: string;
    children: React.ReactNode;
}

function FeatureFlagProvider({ featureFlagConfigURL, children }: FeatureFlagProviderProps) {
    const [featureFlags, setFeatureFlags] = useState<FeatureFlagsType>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeFlags = async () => {
            // Only fetch if featureFlagConfigURL is provided
            if (!featureFlagConfigURL) {
                setFeatureFlags({});
                setIsLoading(false);
                return;
            }

            // Initialize and fetch flags (service is already configured in main.tsx)
            await featureFlagService.initialize((flags) => {
                setFeatureFlags(flags);
            });
            setIsLoading(false);
        };

        initializeFlags();
    }, [featureFlagConfigURL]);

    const isEnabled = useCallback(
        (flagName: string): boolean => {
            return !!featureFlags[flagName];
        },
        [featureFlags],
    );

    const value = useMemo(
        () => ({
            featureFlags,
            isEnabled,
            isLoading,
        }),
        [featureFlags, isEnabled, isLoading],
    );

    return <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>;
}

export default FeatureFlagProvider;
