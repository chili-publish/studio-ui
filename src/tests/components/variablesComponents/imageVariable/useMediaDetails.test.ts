import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { ConnectorMappingDirection } from '@chili-publish/studio-sdk';
import { useMediaDetails } from '../../../../components/variablesComponents/imageVariable/useMediaDetails';
import { useVariablePanelContext } from '../../../../contexts/VariablePanelContext';
import { useSubscriberContext } from '../../../../contexts/Subscriber';
import { Subscriber } from '../../../../utils/subscriber';

jest.mock('../../../../contexts/VariablePanelContext', () => ({
    useVariablePanelContext: jest.fn().mockReturnValue({
        connectorCapabilities: {},
        getCapabilitiesForConnector: jest.fn(),
    }),
}));

jest.mock('../../../../contexts/Subscriber', () => ({
    useSubscriberContext: jest.fn().mockReturnValue({
        subscriber: null,
    }),
}));

describe('"useMediaDetails" hook', () => {
    beforeEach(() => {
        window.SDK.mediaConnector.query = jest.fn().mockResolvedValue({
            parsedData: {
                data: [
                    {
                        id: 'media',
                        name: 'name',
                    },
                ],
            },
        });
        window.SDK.connector.getState = jest.fn().mockResolvedValue({
            parsedData: {
                type: 'ready',
            },
        });
        window.SDK.connector.getMappings = jest.fn().mockResolvedValueOnce({
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
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should not request getState if no connector is provided', () => {
        const { result } = renderHook(() => useMediaDetails(undefined, 'media'));

        expect(window.SDK.connector.getState).not.toHaveBeenCalledWith('grafx-media');

        expect(result.current).toEqual(null);
    });

    it('should wait for connectors readiness', async () => {
        window.SDK.connector.getState = jest.fn().mockResolvedValue({
            parsedData: {
                type: 'loading',
            },
        });
        const { result } = renderHook(() => useMediaDetails('grafx-media', 'media'));

        await waitFor(() => expect(window.SDK.connector.getState).toHaveBeenCalledWith('grafx-media'));
        expect(window.SDK.connector.waitToBeReady).toHaveBeenCalledWith('grafx-media');
        expect(result.current).toEqual(null);
    });

    it('should request connector capabilities', async () => {
        window.SDK.connector.getMappings = jest.fn().mockResolvedValueOnce({
            parsedData: [],
        });
        const getCapabilitiesForConnector = jest.fn();
        (useVariablePanelContext as jest.Mock).mockReturnValue({
            connectorCapabilities: {},
            getCapabilitiesForConnector,
        });
        const { result } = renderHook(() => useMediaDetails('grafx-media', undefined));

        await waitFor(() => expect(window.SDK.connector.getState).toHaveBeenCalledWith('grafx-media'));

        expect(window.SDK.connector.waitToBeReady).not.toHaveBeenCalledWith('grafx-media');

        await waitFor(() => expect(window.SDK.connector.getMappings).toHaveBeenCalledWith('grafx-media'));
        await waitFor(() => expect(getCapabilitiesForConnector).toHaveBeenCalledWith('grafx-media'));

        expect(window.SDK.mediaConnector.query).not.toHaveBeenCalled();
        expect(result.current).toEqual(null);
    });

    it('should not request connector capabilities', async () => {
        window.SDK.connector.getMappings = jest.fn().mockResolvedValueOnce({
            parsedData: null,
        });
        const getCapabilitiesForConnector = jest.fn();
        (useVariablePanelContext as jest.Mock).mockReturnValue({
            connectorCapabilities: {
                'grafx-media': {},
            },
            getCapabilitiesForConnector,
        });
        const { result } = renderHook(() => useMediaDetails('grafx-media', undefined));

        await waitFor(() => expect(window.SDK.connector.getState).toHaveBeenCalledWith('grafx-media'));

        await waitFor(() => expect(window.SDK.connector.getMappings).toHaveBeenCalledWith('grafx-media'));

        expect(getCapabilitiesForConnector).not.toHaveBeenCalledWith('grafx-media');
        expect(window.SDK.mediaConnector.query).not.toHaveBeenCalled();
        expect(result.current).toEqual(null);
    });

    /**
     * 1. emits on connectorToEngine variables
     * 2. emits on not variable mapped mappings
     * 3. emits on the right variable id
     */
    it('should not request media details if emits on "connectorToEngine" variables', async () => {
        const mockSubscriber = new Subscriber();
        (useSubscriberContext as jest.Mock).mockReturnValue({
            subscriber: mockSubscriber,
        });
        const { result } = renderHook(() => useMediaDetails('grafx-media', 'media-asset-id'));

        await waitFor(() => expect(window.SDK.connector.getState).toHaveBeenCalledWith('grafx-media'));
        await waitFor(() => expect(window.SDK.connector.getMappings).toHaveBeenCalledWith('grafx-media'));

        const variableChange = { id: '7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2', value: '1234' };
        mockSubscriber.emit('onVariableValueChanged', variableChange);

        await act(() => {
            expect(window.SDK.mediaConnector.query).not.toHaveBeenCalled();
            expect(result.current).toEqual(null);
        });
    });

    it('should not request media details if emits on none variable mapping', async () => {
        const mockSubscriber = new Subscriber();
        (useSubscriberContext as jest.Mock).mockReturnValue({
            subscriber: mockSubscriber,
        });
        const { result } = renderHook(() => useMediaDetails('grafx-media', 'media-asset-id'));

        await waitFor(() => expect(window.SDK.connector.getState).toHaveBeenCalledWith('grafx-media'));
        await waitFor(() => expect(window.SDK.connector.getMappings).toHaveBeenCalledWith('grafx-media'));

        const variableChange = { id: '2', value: '1234' };
        mockSubscriber.emit('onVariableValueChanged', variableChange);

        await act(() => {
            expect(window.SDK.mediaConnector.query).not.toHaveBeenCalled();
            expect(result.current).toEqual(null);
        });
    });

    it('should not request media details if no "query" capability available', async () => {
        const mockSubscriber = new Subscriber();
        (useSubscriberContext as jest.Mock).mockReturnValue({
            subscriber: mockSubscriber,
        });
        (useVariablePanelContext as jest.Mock).mockReturnValue({
            connectorCapabilities: {
                'grafx-media': {
                    query: false,
                },
            },
            getCapabilitiesForConnector: jest.fn(),
        });
        const { result } = renderHook(() => useMediaDetails('grafx-media', 'media-asset-id'));

        await waitFor(() => expect(window.SDK.connector.getState).toHaveBeenCalledWith('grafx-media'));
        await waitFor(() => expect(window.SDK.connector.getMappings).toHaveBeenCalledWith('grafx-media'));

        const variableChange = { id: '8A59BB89-898D-4BAC-9C8F-F40F6C83479E', value: '1234' };
        mockSubscriber.emit('onVariableValueChanged', variableChange);

        await act(() => {
            expect(window.SDK.mediaConnector.query).not.toHaveBeenCalled();
            expect(result.current).toEqual(null);
        });
    });

    it('should request media details and return null', async () => {
        const mockSubscriber = new Subscriber();
        (useSubscriberContext as jest.Mock).mockReturnValue({
            subscriber: mockSubscriber,
        });
        (useVariablePanelContext as jest.Mock).mockReturnValue({
            connectorCapabilities: {
                'grafx-media': {
                    query: true,
                },
            },
            getCapabilitiesForConnector: jest.fn(),
        });
        window.SDK.mediaConnector.query = jest.fn().mockResolvedValue({
            parsedData: null,
        });
        const { result } = renderHook(() => useMediaDetails('grafx-media', 'media-asset-id'));

        await waitFor(() => expect(window.SDK.connector.getState).toHaveBeenCalledWith('grafx-media'));
        await waitFor(() => expect(window.SDK.connector.getMappings).toHaveBeenCalledWith('grafx-media'));

        const variableChange = { id: '8A59BB89-898D-4BAC-9C8F-F40F6C83479E', value: '1234' };
        mockSubscriber.emit('onVariableValueChanged', variableChange);

        await waitFor(() =>
            expect(window.SDK.mediaConnector.query).toHaveBeenCalledWith(
                'grafx-media',
                { filter: ['media-asset-id'] },
                {},
            ),
        );

        await act(() => {
            expect(result.current).toEqual(null);
        });
    });

    it('should request media details', async () => {
        const mockSubscriber = new Subscriber();
        (useSubscriberContext as jest.Mock).mockReturnValue({
            subscriber: mockSubscriber,
        });
        (useVariablePanelContext as jest.Mock).mockReturnValue({
            connectorCapabilities: {
                'grafx-media': {
                    query: true,
                },
            },
            getCapabilitiesForConnector: jest.fn(),
        });
        const { result } = renderHook(() => useMediaDetails('grafx-media', 'media-asset-id'));

        await waitFor(() => expect(window.SDK.connector.getState).toHaveBeenCalledWith('grafx-media'));
        await waitFor(() => expect(window.SDK.connector.getMappings).toHaveBeenCalledWith('grafx-media'));

        const variableChange = { id: '8A59BB89-898D-4BAC-9C8F-F40F6C83479E', value: '1234' };
        mockSubscriber.emit('onVariableValueChanged', variableChange);

        await waitFor(() =>
            expect(window.SDK.mediaConnector.query).toHaveBeenCalledWith(
                'grafx-media',
                { filter: ['media-asset-id'] },
                {},
            ),
        );

        await act(() => {
            expect(result.current).toEqual({
                id: 'media',
                name: 'name',
            });
        });
    });

    // it('should call "download" with "ready" state check', async () => {
    //     window.SDK.mediaConnector.download = jest.fn().mockRejectedValueOnce('Random Error');
    //     window.SDK.connector.getState = jest.fn().mockResolvedValueOnce({
    //         parsedData: {
    //             type: 'ready',
    //         },
    //     });
    //     const { result } = renderHook(() => usePreviewImageUrl('grafx-media', 'media-asset-id'));

    //     await waitFor(() => expect(window.SDK.connector.getState).toHaveBeenCalledWith('grafx-media'));

    //     act(() => {
    //         expect(window.SDK.connector.waitToBeReady).not.toHaveBeenCalled();
    //         expect(window.SDK.mediaConnector.download).toHaveBeenCalledTimes(1);
    //         expect(result.current).toEqual(null);
    //     });
    // });

    // it('should call "download" with "loading" state check', async () => {
    //     window.SDK.mediaConnector.download = jest
    //         .fn()
    //         .mockRejectedValueOnce('Random Error')
    //         .mockResolvedValueOnce(new Uint8Array());
    //     window.SDK.connector.getState = jest.fn().mockResolvedValueOnce({
    //         parsedData: {
    //             type: 'loading',
    //         },
    //     });
    //     const { result } = renderHook(() => usePreviewImageUrl('grafx-media', 'media-asset-id'));

    //     await waitFor(() => expect(window.SDK.connector.getState).toHaveBeenCalledWith('grafx-media'));

    //     act(() => {
    //         expect(window.SDK.connector.waitToBeReady).toHaveBeenCalledWith('grafx-media');
    //         expect(window.SDK.mediaConnector.download).toHaveBeenCalledTimes(2);
    //         expect(result.current).toEqual('http://url.com');
    //     });
    // });
});
