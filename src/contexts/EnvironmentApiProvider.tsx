import React, { createContext, useContext, useRef, useEffect, ReactNode, useMemo } from 'react';
import {
    Configuration,
    ConnectorsApi,
    ProjectsApi,
    UserInterfacesApi,
    SettingsApi,
    OutputApi,
} from '@chili-publish/environment-client-api';

interface EnvironmentApiContextType {
    apisRef: React.RefObject<{
        connectorsApi: ConnectorsApi | null;
        projectsApi: ProjectsApi | null;
        userInterfacesApi: UserInterfacesApi | null;
        settingsApi: SettingsApi | null;
        outputApi: OutputApi | null;
    }>;
    environment: string;
    isInitialized: boolean;
}

const EnvironmentApiContext = createContext<EnvironmentApiContextType | undefined>(undefined);

interface EnvironmentApiProviderProps {
    children: ReactNode;
    environment: string;
    authToken: string;
    baseUrl?: string;
}

export function EnvironmentApiProvider({ children, environment, authToken, baseUrl }: EnvironmentApiProviderProps) {
    const apisRef = useRef<{
        connectorsApi: ConnectorsApi | null;
        projectsApi: ProjectsApi | null;
        userInterfacesApi: UserInterfacesApi | null;
        settingsApi: SettingsApi | null;
        outputApi: OutputApi | null;
    }>({
        connectorsApi: null,
        projectsApi: null,
        userInterfacesApi: null,
        settingsApi: null,
        outputApi: null,
    });

    const [isInitialized, setIsInitialized] = React.useState(false);

    useEffect(() => {
        if (!environment || !authToken) {
            return;
        }

        const config = new Configuration({
            basePath: baseUrl || `${environment}/grafx/api/v1`,
            accessToken: authToken,
        });

        // Initialize all API instances
        apisRef.current = {
            connectorsApi: new ConnectorsApi(config),
            projectsApi: new ProjectsApi(config),
            userInterfacesApi: new UserInterfacesApi(config),
            settingsApi: new SettingsApi(config),
            outputApi: new OutputApi(config),
        };

        setIsInitialized(true);
    }, [environment, authToken, baseUrl]);

    const value: EnvironmentApiContextType = useMemo(
        () => ({
            apisRef,
            environment,
            isInitialized,
        }),
        [apisRef, environment, isInitialized],
    );

    return <EnvironmentApiContext.Provider value={value}>{children}</EnvironmentApiContext.Provider>;
}

export function useEnvironmentApiContext(): EnvironmentApiContextType {
    const context = useContext(EnvironmentApiContext);
    if (context === undefined) {
        throw new Error('useEnvironmentApiContext must be used within an EnvironmentApiProvider');
    }
    return context;
}
