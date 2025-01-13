import { ConnectorMappingDirection } from '@chili-publish/studio-sdk';
import {
    ConnectorGrafxRegistration,
    ConnectorInstance,
    ConnectorLocalRegistration,
    ConnectorRegistrationSource,
    ConnectorUrlRegistration,
} from '@chili-publish/studio-sdk/lib/src/next';
import axios from 'axios';
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
    authToken: string,
): Promise<MediaRemoteConnector> {
    const { parsedData: engineConnector } = await window.StudioUISDK.next.connector.getById(connectorId);
    if (engineConnector) {
        if (
            isConnectorUrlRegistration(engineConnector.source) ||
            isConnectorLocalRegistration(engineConnector.source)
        ) {
            const res = await axios.get<MediaRemoteConnector>(engineConnector.source.url, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            return res.data;
        }
        const res = await axios.get<MediaRemoteConnector>(
            `${graFxStudioEnvironmentApiBaseUrl}/connectors/${engineConnector.source.id}`,
            { headers: { Authorization: `Bearer ${authToken}` } },
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
        await window.StudioUISDK.mediaConnector.query(connectorId, {});
    } catch (error) {
        throw new Error(`Unauthorized: ${(error as Error).message}`);
    }
}

export function getEnvId(connector: ConnectorInstance) {
    if (isConnectorLocalRegistration(connector.source) || isConnectorUrlRegistration(connector.source))
        return connector.source.url.split('/').at(-1) ?? '';

    return connector.source.id;
}

export async function getConnectorConfigurationOptions(connectorId: string) {
    const { parsedData } = await window.StudioUISDK.connector.getMappings(
        connectorId,
        ConnectorMappingDirection.engineToConnector,
    );
    return (
        parsedData?.reduce((config, mapping) => {
            // eslint-disable-next-line no-param-reassign
            config[mapping.name] = mapping.value;
            return config;
        }, {} as Record<string, string | boolean>) ?? null
    );
}
