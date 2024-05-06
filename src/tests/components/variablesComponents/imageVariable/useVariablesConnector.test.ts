import { mock } from 'jest-mock-extended';
import EditorSDK, { ImageVariable } from '@chili-publish/studio-sdk';
import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { variables as mockVariables } from '../../../mocks/mockVariables';
import { useVariableConnector } from '../../../../components/variablesComponents/imageVariable/useVariableConnector';

jest.mock('axios');

describe('"useVariablesConnector" hook', () => {
    beforeEach(() => {
        const mockSDK = mock<EditorSDK>();
        mockSDK.connector.getById = jest.fn().mockResolvedValue({
            parsedData: {
                source: { url: 'http://deploy.com/media-connector' },
            },
        });
        window.SDK = mockSDK;

        (axios.get as jest.Mock).mockResolvedValue({
            data: {
                id: 'remote-connector-1',
            },
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should set connector', async () => {
        const currentImageVariable: ImageVariable = mockVariables[0];
        const { result } = renderHook(() => useVariableConnector(currentImageVariable));

        await waitFor(() => {
            expect(window.SDK.connector.getById).toHaveBeenCalledWith(currentImageVariable.value?.connectorId);
        });

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith('http://deploy.com/media-connector');
        });

        expect(result.current.selectedConnector).toEqual({
            id: 'remote-connector-1',
        });
    });
});
