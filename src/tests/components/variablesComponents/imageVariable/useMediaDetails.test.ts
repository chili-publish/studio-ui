import { ConnectorMappingDirection, Variable } from '@chili-publish/studio-sdk';
import { act, waitFor } from '@testing-library/react';
import { renderHookWithProviders } from '@tests/mocks/Provider';
import { useMediaDetails } from '../../../../components/variablesComponents/imageVariable/useMediaDetails';
import { useSubscriberContext } from '../../../../contexts/Subscriber';
import { Subscriber } from '../../../../utils/subscriber';
import { setupStore } from '../../../../store';
import * as mediaReducer from '../../../../store/reducers/mediaReducer';
import { setConnectorCapabilities } from '../../../../store/reducers/mediaReducer';

jest.mock('../../../../contexts/Subscriber', () => ({
    useSubscriberContext: jest.fn().mockReturnValue({
        subscriber: null,
    }),
}));

describe('"useMediaDetails" hook', () => {
    beforeEach(() => {
        window.StudioUISDK.mediaConnector.query = jest.fn().mockResolvedValue({
            parsedData: {
                data: [
                    {
                        id: 'media',
                        name: 'name',
                    },
                ],
            },
        });
        window.StudioUISDK.mediaConnector.detail = jest.fn().mockResolvedValue({
            parsedData: {
                id: 'media',
                name: 'name',
            },
        });
        window.StudioUISDK.connector.getState = jest.fn().mockResolvedValue({
            parsedData: {
                type: 'ready',
            },
        });
        window.StudioUISDK.connector.getMappings = jest.fn().mockResolvedValueOnce({
            parsedData: [
                {
                    value: 'var.7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2',
                    direction: ConnectorMappingDirection.connectorToEngine,
                },
                {
                    value: '2',
                    direction: ConnectorMappingDirection.engineToConnector,
                },
                {
                    value: 'var.8A59BB89-898D-4BAC-9C8F-F40F6C83479E',
                    direction: ConnectorMappingDirection.engineToConnector,
                },
            ],
        });
        window.StudioUISDK.mediaConnector.getCapabilities = jest.fn().mockResolvedValue({
            parsedData: {
                query: true,
                detail: true,
                filtering: true,
            },
        });
        window.StudioUISDK.variable.getAll = jest.fn().mockResolvedValue({
            parsedData: [
                {
                    id: '7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2',
                },
                {
                    id: '8A59BB89-898D-4BAC-9C8F-F40F6C83479E',
                },
            ],
        });

        jest.spyOn(mediaReducer, 'getCapabilitiesForConnector');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should not request getState if no connector is provided', async () => {
        const reduxStore = setupStore();
        const { result } = renderHookWithProviders(() => useMediaDetails(undefined, 'media'), { reduxStore });

        await waitFor(() => expect(window.StudioUISDK.variable.getAll).toHaveBeenCalled());
        expect(window.StudioUISDK.connector.getState).not.toHaveBeenCalledWith('grafx-media');

        expect(result.current).toEqual(null);
    });

    it('should wait for connectors readiness', async () => {
        window.StudioUISDK.connector.getState = jest.fn().mockResolvedValue({
            parsedData: {
                type: 'loading',
            },
        });
        const reduxStore = setupStore();
        const { result } = renderHookWithProviders(() => useMediaDetails('grafx-media', 'media'), { reduxStore });

        await waitFor(() => expect(window.StudioUISDK.connector.getState).toHaveBeenCalledWith('grafx-media'));
        expect(window.StudioUISDK.connector.waitToBeReady).toHaveBeenCalledWith('grafx-media');
        expect(result.current).toEqual(null);
    });

    it('should request connector capabilities', async () => {
        const reduxStore = setupStore();
        window.StudioUISDK.connector.getMappings = jest.fn().mockResolvedValueOnce({
            parsedData: [],
        });
        const { result } = renderHookWithProviders(() => useMediaDetails('grafx-media', undefined), { reduxStore });

        await waitFor(() => expect(window.StudioUISDK.connector.getState).toHaveBeenCalledWith('grafx-media'));

        expect(window.StudioUISDK.connector.waitToBeReady).not.toHaveBeenCalledWith('grafx-media');

        await waitFor(() =>
            expect(window.StudioUISDK.connector.getMappings).toHaveBeenCalledWith(
                'grafx-media',
                ConnectorMappingDirection.engineToConnector,
            ),
        );
        await waitFor(() =>
            expect(mediaReducer.getCapabilitiesForConnector).toHaveBeenCalledWith({ connectorId: 'grafx-media' }),
        );

        expect(window.StudioUISDK.mediaConnector.query).not.toHaveBeenCalled();
        expect(result.current).toEqual(null);
    });

    it('should not request connector capabilities', async () => {
        const reduxStore = setupStore();
        reduxStore.dispatch(
            setConnectorCapabilities({
                'grafx-media': {
                    query: true,
                    detail: true,
                    filtering: true,
                },
            }),
        );
        window.StudioUISDK.connector.getMappings = jest.fn().mockResolvedValueOnce({
            parsedData: null,
        });
        const { result } = renderHookWithProviders(() => useMediaDetails('grafx-media', undefined), { reduxStore });

        await waitFor(() => expect(window.StudioUISDK.connector.getState).toHaveBeenCalledWith('grafx-media'));

        await waitFor(() =>
            expect(window.StudioUISDK.connector.getMappings).toHaveBeenCalledWith(
                'grafx-media',
                ConnectorMappingDirection.engineToConnector,
            ),
        );

        expect(mediaReducer.getCapabilitiesForConnector).not.toHaveBeenCalledWith('grafx-media');
        expect(window.StudioUISDK.mediaConnector.query).not.toHaveBeenCalled();
        expect(result.current).toEqual(null);
    });

    it('should not request media details if emits on "connectorToEngine" variables', async () => {
        const mockSubscriber = new Subscriber();
        const reduxStore = setupStore();
        reduxStore.dispatch(
            setConnectorCapabilities({
                'grafx-media': {
                    query: true,
                    detail: false,
                    filtering: false,
                },
            }),
        );
        (useSubscriberContext as jest.Mock).mockReturnValue({
            subscriber: mockSubscriber,
        });

        renderHookWithProviders(() => useMediaDetails('grafx-media', 'media-asset-id'), { reduxStore });

        await waitFor(() => expect(window.StudioUISDK.connector.getState).toHaveBeenCalledWith('grafx-media'));
        await waitFor(() =>
            expect(window.StudioUISDK.connector.getMappings).toHaveBeenCalledWith(
                'grafx-media',
                ConnectorMappingDirection.engineToConnector,
            ),
        );

        const variableChange = { id: '7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2', value: '1234' } as unknown as Variable;
        await act(() => {
            mockSubscriber.emit('onVariableListChanged', [variableChange]);
        });

        await waitFor(() => {
            expect(window.StudioUISDK.mediaConnector.query).not.toHaveBeenCalled();
        });
    });

    it('should not request media details if emits on none variable mapping', async () => {
        const mockSubscriber = new Subscriber();
        (useSubscriberContext as jest.Mock).mockReturnValue({
            subscriber: mockSubscriber,
        });
        const reduxStore = setupStore();
        reduxStore.dispatch(
            setConnectorCapabilities({
                'grafx-media': {
                    query: true,
                    detail: true,
                    filtering: false,
                },
            }),
        );
        renderHookWithProviders(() => useMediaDetails('grafx-media', 'media-asset-id'), { reduxStore });

        await waitFor(() => expect(window.StudioUISDK.connector.getState).toHaveBeenCalledWith('grafx-media'));
        await waitFor(() =>
            expect(window.StudioUISDK.connector.getMappings).toHaveBeenCalledWith(
                'grafx-media',
                ConnectorMappingDirection.engineToConnector,
            ),
        );

        const variableChange = { id: '2', value: '1234' } as unknown as Variable;
        mockSubscriber.emit('onVariableListChanged', [variableChange]);

        await waitFor(() => {
            expect(window.StudioUISDK.mediaConnector.query).not.toHaveBeenCalled();
        });
    });

    it('should not request media details if neither "query" or "detail" capabilities are available', async () => {
        const mockSubscriber = new Subscriber();
        (useSubscriberContext as jest.Mock).mockReturnValue({
            subscriber: mockSubscriber,
        });
        const reduxStore = setupStore();
        reduxStore.dispatch(
            setConnectorCapabilities({
                'grafx-media': {
                    query: false,
                    detail: false,
                    filtering: false,
                },
            }),
        );
        const { result } = renderHookWithProviders(() => useMediaDetails('grafx-media', 'media-asset-id'), {
            reduxStore,
        });

        await waitFor(() => expect(window.StudioUISDK.connector.getState).toHaveBeenCalledWith('grafx-media'));
        await waitFor(() =>
            expect(window.StudioUISDK.connector.getMappings).toHaveBeenCalledWith(
                'grafx-media',
                ConnectorMappingDirection.engineToConnector,
            ),
        );

        const variableChange = { id: '8A59BB89-898D-4BAC-9C8F-F40F6C83479E', value: '1234' } as unknown as Variable;
        act(() => {
            mockSubscriber.emit('onVariableListChanged', [variableChange]);
        });

        await waitFor(() => {
            expect(window.StudioUISDK.mediaConnector.query).not.toHaveBeenCalled();
            expect(result.current).toEqual(null);
        });
    });

    it('should request media details and return null', async () => {
        const mockSubscriber = new Subscriber();
        (useSubscriberContext as jest.Mock).mockReturnValue({
            subscriber: mockSubscriber,
        });
        const reduxStore = setupStore();
        reduxStore.dispatch(
            setConnectorCapabilities({
                'grafx-media': {
                    query: true,
                    detail: false,
                    filtering: true,
                },
            }),
        );
        window.StudioUISDK.mediaConnector.query = jest.fn().mockResolvedValue({
            parsedData: null,
        });
        const { result } = renderHookWithProviders(() => useMediaDetails('grafx-media', 'media-asset-id'), {
            reduxStore,
        });

        await waitFor(() => expect(window.StudioUISDK.connector.getState).toHaveBeenCalledWith('grafx-media'));
        await waitFor(() =>
            expect(window.StudioUISDK.connector.getMappings).toHaveBeenCalledWith(
                'grafx-media',
                ConnectorMappingDirection.engineToConnector,
            ),
        );

        const variableChange = { id: '8A59BB89-898D-4BAC-9C8F-F40F6C83479E', value: '1234' } as unknown as Variable;
        mockSubscriber.emit('onVariableListChanged', [variableChange]);

        await waitFor(() =>
            expect(window.StudioUISDK.mediaConnector.query).toHaveBeenCalledWith(
                'grafx-media',
                { filter: ['media-asset-id'], pageSize: 1 },
                {},
            ),
        );

        expect(window.StudioUISDK.mediaConnector.query).toHaveBeenCalledTimes(2);

        await waitFor(() => {
            expect(result.current).toEqual(null);
        });
    });

    it('should request media details and return value', async () => {
        const mockSubscriber = new Subscriber();
        (useSubscriberContext as jest.Mock).mockReturnValue({
            subscriber: mockSubscriber,
        });
        const mockValue = {
            connectorCapabilities: {
                'grafx-media': {
                    query: true,
                    filtering: true,
                    detail: true,
                },
            },
            getCapabilitiesForConnector: jest.fn(),
        };
        const reduxStore = setupStore();
        reduxStore.dispatch(setConnectorCapabilities(mockValue.connectorCapabilities));
        const { result } = renderHookWithProviders(() => useMediaDetails('grafx-media', 'media-asset-id'), {
            reduxStore,
        });

        await waitFor(() => expect(window.StudioUISDK.connector.getState).toHaveBeenCalledWith('grafx-media'));
        await waitFor(() =>
            expect(window.StudioUISDK.connector.getMappings).toHaveBeenCalledWith(
                'grafx-media',
                ConnectorMappingDirection.engineToConnector,
            ),
        );

        const variableChange = { id: '8A59BB89-898D-4BAC-9C8F-F40F6C83479E', value: '1234' } as unknown as Variable;
        await act(() => {
            mockSubscriber.emit('onVariableListChanged', [variableChange]);
        });

        await waitFor(() =>
            expect(window.StudioUISDK.mediaConnector.query).toHaveBeenCalledWith(
                'grafx-media',
                { filter: ['media-asset-id'], pageSize: 1 },
                {},
            ),
        );

        expect(window.StudioUISDK.mediaConnector.query).toHaveBeenCalled();
        expect(window.StudioUISDK.mediaConnector.detail).not.toHaveBeenCalled();

        await waitFor(() => {
            expect(result.current).toEqual({
                id: 'media',
                name: 'name',
            });
        });
    });

    it('should request media details with "detail" capability and return value', async () => {
        const mockSubscriber = new Subscriber();
        (useSubscriberContext as jest.Mock).mockReturnValue({
            subscriber: mockSubscriber,
        });
        const mockValue = {
            connectorCapabilities: {
                'grafx-media': {
                    query: true,
                    detail: true,
                    filtering: false,
                },
            },
            getCapabilitiesForConnector: jest.fn(),
        };
        const reduxStore = setupStore();
        reduxStore.dispatch(setConnectorCapabilities(mockValue.connectorCapabilities));
        const { result } = renderHookWithProviders(() => useMediaDetails('grafx-media', 'media-asset-id'), {
            reduxStore,
        });

        const variableChange = { id: '8A59BB89-898D-4BAC-9C8F-F40F6C83479E', value: '1234' } as unknown as Variable;
        await act(() => {
            mockSubscriber.emit('onVariableListChanged', [variableChange]);
        });

        await waitFor(() =>
            expect(window.StudioUISDK.mediaConnector.detail).toHaveBeenCalledWith('grafx-media', 'media-asset-id'),
        );

        expect(window.StudioUISDK.mediaConnector.query).not.toHaveBeenCalled();

        await waitFor(() => {
            expect(result.current).toEqual({
                id: 'media',
                name: 'name',
            });
        });
    });
});
