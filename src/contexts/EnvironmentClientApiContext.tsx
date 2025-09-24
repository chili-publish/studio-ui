import React, { createContext, useContext, ReactNode } from 'react';
import { EnvironmentApiService } from 'src/services/EnvironmentApiService';

interface EnvironmentClientApiContextType {
    environmentApiService: EnvironmentApiService;
}

const EnvironmentClientApiContext = createContext<EnvironmentClientApiContextType | undefined>(undefined);

interface EnvironmentClientApiProviderProps {
    children: ReactNode;
    environmentApiService: EnvironmentApiService;
}

export function EnvironmentClientApiProvider({ children, environmentApiService }: EnvironmentClientApiProviderProps) {
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const value: EnvironmentClientApiContextType = {
        environmentApiService,
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
