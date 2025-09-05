import React, { createContext, useContext, ReactNode } from 'react';
import {
    ConnectorsApi,
    ProjectsApi,
    UserInterfacesApi,
    SettingsApi,
    OutputApi,
} from '@chili-publish/environment-client-api';

interface EnvironmentClientApiContextType {
    connectorsApi: ConnectorsApi;
    projectsApi: ProjectsApi;
    userInterfacesApi: UserInterfacesApi;
    settingsApi: SettingsApi;
    outputApi: OutputApi;
    environment: string;
}

const EnvironmentClientApiContext = createContext<EnvironmentClientApiContextType | undefined>(undefined);

interface EnvironmentClientApiProviderProps {
    children: ReactNode;
    connectorsApi: ConnectorsApi;
    projectsApi: ProjectsApi;
    userInterfacesApi: UserInterfacesApi;
    settingsApi: SettingsApi;
    outputApi: OutputApi;
    environment: string;
}

export function EnvironmentClientApiProvider({
    children,
    connectorsApi,
    projectsApi,
    userInterfacesApi,
    settingsApi,
    outputApi,
    environment,
}: EnvironmentClientApiProviderProps) {
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const value: EnvironmentClientApiContextType = {
        connectorsApi,
        projectsApi,
        userInterfacesApi,
        settingsApi,
        outputApi,
        environment,
    };

    return <EnvironmentClientApiContext.Provider value={value}>{children}</EnvironmentClientApiContext.Provider>;
}

export function useEnvironmentClientApiContext(): EnvironmentClientApiContextType {
    const context = useContext(EnvironmentClientApiContext);
    if (context === undefined) {
        throw new Error('useEnvironmentClientApiContext must be used within an EnvironmentClientApiProvider');
    }
    return context;
}
