import { ConnectorAuthenticationResult } from 'src/types/ConnectorAuthenticationResult';

export type ConnectorAuthResult = {
    result: ConnectorAuthenticationResult | null;
    connectorName: string;
    remoteConnectorId: string;
};
