import { createContext, useContext, useMemo } from 'react';
import { FeatureFlagsType } from 'src/types/types';

interface IFeatureFlagContext {
    featureFlags?: FeatureFlagsType;
}

export const FeatureFlagContextDefaultValues: IFeatureFlagContext = {
    featureFlags: {},
};

export const FeatureFlagContext = createContext<IFeatureFlagContext>(FeatureFlagContextDefaultValues);

export const useFeatureFlagContext = () => {
    return useContext(FeatureFlagContext);
};

function FeatureFlagProvider({
    featureFlags,
    children,
}: {
    featureFlags?: FeatureFlagsType;
    children: React.ReactNode;
}) {
    const data = useMemo(
        () => ({
            featureFlags,
        }),
        [featureFlags],
    );

    return <FeatureFlagContext.Provider value={data}>{children}</FeatureFlagContext.Provider>;
}

export default FeatureFlagProvider;
