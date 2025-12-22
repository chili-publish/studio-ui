import { featureFlagService } from '@chili-publish/grafx-shared-components';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FeatureFlagsType } from '../types/types';

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
    children: React.ReactNode;
}

function FeatureFlagProvider({ children }: FeatureFlagProviderProps) {
    const [featureFlags, setFeatureFlags] = useState<FeatureFlagsType>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initialize and fetch flags (service is already configured in main.tsx)
        featureFlagService.initialize((flags) => {
            setFeatureFlags(flags);
            setIsLoading(false);
        });
    }, []);

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
