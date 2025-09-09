import { usePreviewImageUrl as coreHook } from '@chili-publish/grafx-shared-components';
import EditorSDK, { ConnectorHttpError } from '@chili-publish/studio-sdk';
import { waitFor } from '@testing-library/react';
import { mock } from 'jest-mock-extended';

import { renderHookWithProviders } from '@tests/mocks/Provider';
import { usePreviewImage } from '../../../../components/variablesComponents/imageVariable/usePreviewImage';

jest.mock('@chili-publish/grafx-shared-components', () => ({
    ...jest.requireActual('@chili-publish/grafx-shared-components'),
    usePreviewImageUrl: jest.fn(),
}));

// Mock the SDK
const mockSDK = mock<EditorSDK>();
window.StudioUISDK = mockSDK;

describe('usePreviewImage', () => {
    const mockConnectorId = 'test-connector-id';
    const mockMediaAssetId = 'test-asset-id';
    const mockMediaDetails = {
        id: 'test-asset-id',
        name: 'Test Media',
        extension: 'jpg',
    };

    const mockPreloadedState = {
        media: {
            connectors: {},
            connectorCapabilities: {
                [mockConnectorId]: {
                    query: true,
                    filtering: true,
                    detail: true,
                },
            },
        },
    };

    beforeEach(() => {
        // Set up default mock for usePreviewImageUrl
        (coreHook as jest.Mock).mockReturnValue({
            previewImageUrl: null,
            pending: false,
            error: null,
            resetError: jest.fn(),
        });

        // Mock SDK functions
        mockSDK.mediaConnector.download = jest.fn();
        mockSDK.mediaConnector.query = jest.fn();
        mockSDK.mediaConnector.detail = jest.fn();
        mockSDK.connector.getState = jest.fn();
        mockSDK.connector.waitToBeReady = jest.fn();
        mockSDK.connector.getMappings = jest.fn();
        mockSDK.variable.getAll = jest.fn();

        // Default connector state
        (mockSDK.connector.getState as jest.Mock).mockResolvedValue({
            parsedData: { type: 'ready' },
        });

        // Default mappings
        (mockSDK.connector.getMappings as jest.Mock).mockResolvedValue({
            parsedData: [],
        });

        // Default variables
        (mockSDK.variable.getAll as jest.Mock).mockResolvedValue({
            parsedData: [],
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return previewImage when both media details and preview URL are successful', async () => {
        // Mock successful media details fetch
        (mockSDK.mediaConnector.query as jest.Mock).mockResolvedValue({
            parsedData: { data: [mockMediaDetails] },
        });

        // Mock successful preview URL
        (coreHook as jest.Mock).mockReturnValue({
            previewImageUrl: 'http://example.com/image.jpg',
            pending: false,
            error: null,
            resetError: jest.fn(),
        });

        const { result } = renderHookWithProviders(() => usePreviewImage(mockConnectorId, mockMediaAssetId), {
            preloadedState: mockPreloadedState,
        });

        await waitFor(() => {
            expect(result.current.previewImage).toEqual({
                id: 'test-asset-id',
                name: 'Test Media',
                format: 'jpg',
                url: 'http://example.com/image.jpg',
            });
            expect(result.current.pending).toBe(false);
            expect(result.current.error).toBeUndefined();
        });
    });

    it('should handle missing asset error when media details query returns no results', async () => {
        // Mock empty media details
        (mockSDK.mediaConnector.query as jest.Mock).mockResolvedValue({
            parsedData: { data: [] },
        });

        const { result } = renderHookWithProviders(() => usePreviewImage(mockConnectorId, mockMediaAssetId), {
            preloadedState: mockPreloadedState,
        });

        await waitFor(() => {
            expect(result.current.previewImage).toBeUndefined();
            expect(result.current.error).toBeDefined(); // Just check that an error is set
        });
    });

    it('should handle 401 Unauthorized error in media details fetch', async () => {
        // Mock 401 error for media details fetch
        const unauthorizedError = new ConnectorHttpError(401, 'Unauthorized');
        (mockSDK.mediaConnector.query as jest.Mock).mockRejectedValue(unauthorizedError);

        const { result } = renderHookWithProviders(() => usePreviewImage(mockConnectorId, mockMediaAssetId), {
            preloadedState: mockPreloadedState,
        });

        await waitFor(() => {
            expect(result.current.previewImage).toBeUndefined();
            expect(result.current.error).toBeDefined();
        });
    });

    it('should handle 404 Not Found error in media details fetch', async () => {
        // Mock 404 error for media details fetch
        const notFoundError = new ConnectorHttpError(404, 'Not Found');
        (mockSDK.mediaConnector.query as jest.Mock).mockRejectedValue(notFoundError);

        const { result } = renderHookWithProviders(() => usePreviewImage(mockConnectorId, mockMediaAssetId), {
            preloadedState: mockPreloadedState,
        });

        await waitFor(() => {
            expect(result.current.previewImage).toBeUndefined();
            expect(result.current.error).toBeDefined();
        });
    });

    it('should handle 401 Unauthorized error in preview URL', async () => {
        // Mock successful media details
        (mockSDK.mediaConnector.query as jest.Mock).mockResolvedValue({
            parsedData: { data: [mockMediaDetails] },
        });

        // Mock 401 error in preview URL
        const unauthorizedError = new ConnectorHttpError(401, 'Unauthorized');
        (coreHook as jest.Mock).mockReturnValue({
            previewImageUrl: null,
            pending: false,
            error: unauthorizedError,
            resetError: jest.fn(),
        });

        const { result } = renderHookWithProviders(() => usePreviewImage(mockConnectorId, mockMediaAssetId), {
            preloadedState: mockPreloadedState,
        });

        await waitFor(() => {
            expect(result.current.previewImage).toBeUndefined();
            expect(result.current.error).toBeDefined();
        });
    });

    it('should handle 404 Not Found error in preview URL', async () => {
        // Mock successful media details
        (mockSDK.mediaConnector.query as jest.Mock).mockResolvedValue({
            parsedData: { data: [mockMediaDetails] },
        });

        // Mock 404 error in preview URL
        const notFoundError = new ConnectorHttpError(404, 'Not Found');
        (coreHook as jest.Mock).mockReturnValue({
            previewImageUrl: null,
            pending: false,
            error: notFoundError,
            resetError: jest.fn(),
        });

        const { result } = renderHookWithProviders(() => usePreviewImage(mockConnectorId, mockMediaAssetId), {
            preloadedState: mockPreloadedState,
        });

        await waitFor(() => {
            expect(result.current.previewImage).toBeUndefined();
            expect(result.current.error).toBeDefined();
        });
    });

    it('should not fetch preview URL when media details are not available', async () => {
        // Mock empty media details
        (mockSDK.mediaConnector.query as jest.Mock).mockResolvedValue({
            parsedData: { data: [] },
        });

        const { result } = renderHookWithProviders(() => usePreviewImage(mockConnectorId, mockMediaAssetId), {
            preloadedState: mockPreloadedState,
        });

        await waitFor(() => {
            expect(result.current.previewImage).toBeUndefined();
        });

        // Verify that the core hook was called with undefined (no media details)
        expect(coreHook).toHaveBeenCalledWith(undefined, expect.any(Function));
    });

    it('should handle media details fetch error', async () => {
        // Mock media details fetch error
        (mockSDK.mediaConnector.query as jest.Mock).mockRejectedValue(new Error('Network error'));

        const { result } = renderHookWithProviders(() => usePreviewImage(mockConnectorId, mockMediaAssetId), {
            preloadedState: mockPreloadedState,
        });

        await waitFor(() => {
            expect(result.current.previewImage).toBeUndefined();
            expect(result.current.error).toBeDefined();
        });
    });

    it('should return early when no connectorId or mediaAssetId', () => {
        const { result } = renderHookWithProviders(() => usePreviewImage(undefined, undefined), {
            preloadedState: mockPreloadedState,
        });

        expect(result.current.previewImage).toBeUndefined();
        expect(result.current.pending).toBe(false);
        expect(result.current.error).toBeUndefined();
    });

    it('should use detail connector capability when query is not available', async () => {
        // Mock connector capabilities without query
        const capabilitiesWithoutQuery = {
            media: {
                connectors: {},
                connectorCapabilities: {
                    [mockConnectorId]: {
                        query: false,
                        filtering: false,
                        detail: true,
                    },
                },
            },
        };

        // Mock successful detail call
        (mockSDK.mediaConnector.detail as jest.Mock).mockResolvedValue({
            parsedData: mockMediaDetails,
        });

        const { result } = renderHookWithProviders(() => usePreviewImage(mockConnectorId, mockMediaAssetId), {
            preloadedState: capabilitiesWithoutQuery,
        });

        await waitFor(() => {
            expect(result.current.previewImage).toBeUndefined(); // No preview URL yet
        });

        expect(mockSDK.mediaConnector.detail).toHaveBeenCalledWith(mockConnectorId, mockMediaAssetId);
    });

    it('should handle default error in preview URL', async () => {
        // Mock successful media details
        (mockSDK.mediaConnector.query as jest.Mock).mockResolvedValue({
            parsedData: { data: [mockMediaDetails] },
        });

        // Mock generic error in preview URL
        (coreHook as jest.Mock).mockReturnValue({
            previewImageUrl: null,
            pending: false,
            error: new Error('Generic error'),
            resetError: jest.fn(),
        });

        const { result } = renderHookWithProviders(() => usePreviewImage(mockConnectorId, mockMediaAssetId), {
            preloadedState: mockPreloadedState,
        });

        await waitFor(() => {
            expect(result.current.previewImage).toBeUndefined();
        });
    });
});
