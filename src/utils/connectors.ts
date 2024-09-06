import axios from 'axios';
import {
    ConnectorGrafxRegistration,
    ConnectorLocalRegistration,
    ConnectorRegistrationSource,
    ConnectorUrlRegistration,
} from '@chili-publish/studio-sdk/lib/src/next';
import { MediaRemoteConnector } from './ApiTypes';

const isConnectorUrlRegistration = (
    connector: ConnectorGrafxRegistration | ConnectorUrlRegistration | ConnectorLocalRegistration,
): connector is ConnectorUrlRegistration => {
    return connector.source === ConnectorRegistrationSource.url;
};

const isConnectorLocalRegistration = (
    connector: ConnectorGrafxRegistration | ConnectorUrlRegistration | ConnectorLocalRegistration,
): connector is ConnectorLocalRegistration => {
    return connector.source === ConnectorRegistrationSource.local;
};

// NOTE: Works for Grafx only connectors so far
export async function getRemoteMediaConnector(
    graFxStudioEnvironmentApiBaseUrl: string,
    connectorId: string,
): Promise<MediaRemoteConnector> {
    const { parsedData: engineConnector } = await window.SDK.next.connector.getById(connectorId);
    if (engineConnector) {
        if (
            isConnectorUrlRegistration(engineConnector.source) ||
            isConnectorLocalRegistration(engineConnector.source)
        ) {
            const res = await axios.get<MediaRemoteConnector>(engineConnector.source.url);
            return res.data;
        }
        const res = await axios.get<MediaRemoteConnector>(
            `${graFxStudioEnvironmentApiBaseUrl}/connectors/${engineConnector.source.id}`,
        );
        return res.data;
    }
    throw new Error(`Connector is not found by ${connectorId}`);
}

export function isAuthenticationRequired(connector: MediaRemoteConnector) {
    return connector.supportedAuthentication.browser.includes('oAuth2AuthorizationCode');
}

// The idea is to make any call to connector and if it's unathorized corresponding "onAuthExpired" callback is going to be called in App.tsx
// that runs authentication for the connecotr's authentication type that requires it
// If connector is authorized or don't required user authentication this request just return results
export async function verifyAuthentication(connectorId: string) {
    try {
        await window.SDK.mediaConnector.query(connectorId, {});
    } catch (error) {
        throw new Error(`Unauthorized: ${(error as Error).message}`);
    }
}
