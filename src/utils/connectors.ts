import { ConnectorMappingDirection, EngineToConnectorMapping, Variable } from '@chili-publish/studio-sdk';
import {
    ConnectorGrafxRegistration,
    ConnectorInstance,
    ConnectorLocalRegistration,
    ConnectorRegistrationSource,
    ConnectorUrlRegistration,
} from '@chili-publish/studio-sdk/lib/src/next';
import { isBooleanVariable, isListVariable, isTextVariable } from '../components/variablesComponents/Variable';
import { RemoteConnector } from './ApiTypes';

type ConnectorRegistration = ConnectorGrafxRegistration | ConnectorUrlRegistration | ConnectorLocalRegistration;

const isConnectorUrlRegistration = (connector: ConnectorRegistration): connector is ConnectorUrlRegistration => {
    return connector.source === ConnectorRegistrationSource.url;
};

const isConnectorLocalRegistration = (connector: ConnectorRegistration): connector is ConnectorLocalRegistration => {
    return connector.source === ConnectorRegistrationSource.local;
};

export function getConnectorUrl(connector: ConnectorInstance, graFxStudioEnvironmentApiBaseUrl: string) {
    if (isConnectorUrlRegistration(connector.source) || isConnectorLocalRegistration(connector.source)) {
        return connector.source.url;
    }
    return `${graFxStudioEnvironmentApiBaseUrl}/connectors/${connector.source.id}`;
}

// NOTE: Works for Grafx only connectors so far
export async function getRemoteConnector<RC extends RemoteConnector = RemoteConnector>(
    graFxStudioEnvironmentApiBaseUrl: string,
    connectorId: string,
    authToken: string,
    environmentClientApiMethod?: (connectorId: string) => Promise<RC>,
): Promise<RC> {
    const { parsedData: engineConnector } = await window.StudioUISDK.next.connector.getById(connectorId);
    if (!engineConnector) {
        throw new Error(`Connector is not found by ${connectorId}`);
    }

    // If environment client API method is provided and this is a GraFx connector, try using it first
    if (
        environmentClientApiMethod &&
        !isConnectorUrlRegistration(engineConnector.source) &&
        !isConnectorLocalRegistration(engineConnector.source)
    ) {
        try {
            // Use the connector ID from the engine connector (engineConnector.source.id)
            // This matches the logic in getConnectorUrl function
            const result = await environmentClientApiMethod(engineConnector.source.id);
            return result;
        } catch (error) {
            // If environment client API fails, fall back to the original method
            // eslint-disable-next-line no-console
            console.warn('Environment client API failed, falling back to direct HTTP call:', error);
        }
    }

    // Original logic for external connectors or fallback
    const connectorRequestUrl = getConnectorUrl(engineConnector, graFxStudioEnvironmentApiBaseUrl);
    const response = await fetch(connectorRequestUrl, {
        headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch connector: ${response.statusText}`);
    }
    return response.json();
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

function readValueFromLinkedVariable(variable: Variable) {
    if (isTextVariable(variable) || isBooleanVariable(variable)) {
        return variable.value;
    }
    if (isListVariable(variable)) {
        return variable.selected?.value ?? null;
    }
    throw new Error('Unsupported variable type for link the value');
}

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
                return window.StudioUISDK.next.variable.getById(fromLinkToVariableId(m.value)).then((v) => ({
                    name: m.name,
                    value: readValueFromLinkedVariable(v.parsedData as Variable),
                }));
            }
            return m;
        }),
    );
    return mappingValues.reduce(
        (config, mapping) => {
            config[mapping.name] = mapping.value;
            return config;
        },
        {} as Record<string, string | boolean | null>,
    );
}
