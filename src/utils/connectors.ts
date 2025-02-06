import {
    BooleanVariable,
    ConnectorMappingDirection,
    EngineToConnectorMapping,
    ShortTextVariable,
} from '@chili-publish/studio-sdk';
import {
    ConnectorGrafxRegistration,
    ConnectorInstance,
    ConnectorLocalRegistration,
    ConnectorRegistrationSource,
    ConnectorUrlRegistration,
} from '@chili-publish/studio-sdk/lib/src/next';
import axios from 'axios';
import { RemoteConnector } from './ApiTypes';

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
export async function getRemoteConnector<RC extends RemoteConnector = RemoteConnector>(
    graFxStudioEnvironmentApiBaseUrl: string,
    connectorId: string,
    authToken: string,
): Promise<RC> {
    const { parsedData: engineConnector } = await window.StudioUISDK.next.connector.getById(connectorId);
    if (engineConnector) {
        if (
            isConnectorUrlRegistration(engineConnector.source) ||
            isConnectorLocalRegistration(engineConnector.source)
        ) {
            const res = await axios.get<RC>(engineConnector.source.url, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            return res.data;
        }
        const res = await axios.get<RC>(`${graFxStudioEnvironmentApiBaseUrl}/connectors/${engineConnector.source.id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return res.data;
    }
    throw new Error(`Connector is not found by ${connectorId}`);
}

export function isAuthenticationRequired(connector: RemoteConnector) {
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

export type TextEngineToConnectorMapping = Omit<EngineToConnectorMapping, 'value'> & { value: string };

type LinkedVariable = ShortTextVariable | BooleanVariable;

export function isLinkToVariable(mapping: EngineToConnectorMapping): mapping is TextEngineToConnectorMapping {
    return typeof mapping.value === 'string' && mapping.value.startsWith('var.');
}

export function linkToVariable(variableId: string) {
    return `var.${variableId}`;
}

export function fromLinkToVariableId(value: string) {
    return value.replace('var.', '');
}

export async function getConnectorConfigurationOptions(connectorId: string) {
    const { parsedData } = await window.StudioUISDK.connector.getMappings(
        connectorId,
        ConnectorMappingDirection.engineToConnector,
    );
    if (!parsedData) {
        return null;
    }
    const mappingValues = await Promise.all(
        parsedData.map((m) => {
            if (isLinkToVariable(m)) {
                return window.StudioUISDK.variable.getById(fromLinkToVariableId(m.value)).then((v) => ({
                    name: m.name,
                    value: (v.parsedData as LinkedVariable).value,
                }));
            }
            return m;
        }),
    );
    return mappingValues.reduce((config, mapping) => {
        // eslint-disable-next-line no-param-reassign
        config[mapping.name] = mapping.value;
        return config;
    }, {} as Record<string, string | boolean>);
}
