import EditorSDK, { ImageVariable } from '@chili-publish/studio-sdk';
import { ConnectorRegistrationSource } from '@chili-publish/studio-sdk/lib/src/next';
import { renderHookWithProviders } from '@tests/mocks/Provider';
import { mock } from 'jest-mock-extended';
import { MediaRemoteConnector } from 'src/utils/ApiTypes';
import { useVariableConnector } from '../../../../components/variablesComponents/imageVariable/useVariableConnector';
import { variables as mockVariables } from '../../../mocks/mockVariables';

describe('"useVariablesConnector" hook', () => {
    beforeEach(() => {
        const mockSDK = mock<EditorSDK>();
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        mockSDK.next.connector = {} as any;

        mockSDK.next.connector.getById = jest.fn().mockResolvedValue({
            parsedData: {
                source: { url: 'http://deploy.com/media-connector', source: ConnectorRegistrationSource.url },
            },
        });
        window.StudioUISDK = mockSDK;
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should set connector from store', async () => {
        // Ensure the mock variable is of type ImageVariable
        const currentImageVariable = mockVariables[0] as ImageVariable;
        const { result } = renderHookWithProviders(() => useVariableConnector(currentImageVariable), {
            preloadedState: {
                media: {
                    connectors: {
                        [currentImageVariable.value!.connectorId]: { id: 'remote-connector-1' } as MediaRemoteConnector,
                    },
                    connectorCapabilities: {},
                },
            },
        });

        expect(result.current.remoteConnector).toEqual({
            id: 'remote-connector-1',
        });
    });
});
