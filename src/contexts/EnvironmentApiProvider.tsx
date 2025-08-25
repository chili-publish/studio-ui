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

        // The basePath should be the base URL without the /api/v1 part
        // From: https://cp-qeb-191.cpstaging.online/grafx/api/v1/environment/cp-qeb-191
        // To: https://cp-qeb-191.cpstaging.online/grafx
        let apiBasePath = baseUrl;
        if (!apiBasePath) {
            if (environment.includes('/environment/')) {
                const [baseUrlPart] = environment.split('/environment/');
                // Remove /api/v1 from the base URL
                apiBasePath = baseUrlPart.replace('/api/v1', '');
            } else {
                apiBasePath = environment.replace('/api/v1', '');
            }
        }

        const config = new Configuration({
            basePath: apiBasePath,
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

    // Extract environment name for the context value
    const environmentName = useMemo(() => {
        if (environment.includes('/environment/')) {
            const [, ...rest] = environment.split('/environment/');
            return rest.pop() || environment;
        }
        return environment;
    }, [environment]);

    const value: EnvironmentApiContextType = useMemo(
        () => ({
            apisRef,
            environment: environmentName,
            isInitialized,
        }),
        [apisRef, environmentName, isInitialized],
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
