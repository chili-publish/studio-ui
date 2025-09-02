import { renderHook, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { usePreviewImageUrl } from '../../../../components/variablesComponents/imageVariable/usePreviewImageUrl';

jest.mock('@chili-publish/grafx-shared-components', () => ({
    usePreviewImageUrl: jest.fn((_, previewCall) => {
        const [url, setUrl] = useState<string | null>(null);
        const [error, setError] = useState<Error | null>(null);
        useEffect(() => {
            (async () => {
                try {
                    const result = await previewCall(_).then((res: string | null) => res);
                    return !result ? setUrl(result) : setUrl('http://url.com');
                } catch (err) {
                    setError(err as Error);
                    setUrl(null);
                    return err;
                }
            })();
        }, [_, previewCall]);
        return { previewImageUrl: url, error };
    }),
}));

describe('"usePreviewImageUrl" hook', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should not call "download" if no connector is provided', () => {
        window.StudioUISDK.mediaConnector.download = jest.fn().mockResolvedValueOnce(new Uint8Array());
        const { result } = renderHook(() => usePreviewImageUrl(undefined, 'media-asset-id'));

        expect(window.StudioUISDK.mediaConnector.download).not.toHaveBeenCalled();
        expect(result.current).toEqual({ previewImageUrl: null, error: null });
    });

    it('should call "download" with "ready" state check', async () => {
        window.StudioUISDK.mediaConnector.download = jest.fn().mockRejectedValueOnce('Random Error');
        window.StudioUISDK.connector.getState = jest.fn().mockResolvedValueOnce({
            parsedData: {
                type: 'ready',
            },
        });
        const { result } = renderHook(() => usePreviewImageUrl('grafx-media', 'media-asset-id'));

        await waitFor(() => expect(window.StudioUISDK.connector.getState).toHaveBeenCalledWith('grafx-media'));

        expect(window.StudioUISDK.connector.waitToBeReady).not.toHaveBeenCalled();
        expect(window.StudioUISDK.mediaConnector.download).toHaveBeenCalledTimes(1);
        await waitFor(() => {
            expect(result.current).toEqual(
                expect.objectContaining({
                    error: 'Random Error',
                    previewImageUrl: null,
                }),
            );
        });
    });

    it('should call "download" with "loading" state check', async () => {
        window.StudioUISDK.mediaConnector.download = jest
            .fn()
            .mockRejectedValueOnce('Random Error')
            .mockResolvedValueOnce(new Uint8Array());
        window.StudioUISDK.connector.getState = jest.fn().mockResolvedValueOnce({
            parsedData: {
                type: 'loading',
            },
        });
        const { result } = renderHook(() => usePreviewImageUrl('grafx-media', 'media-asset-id'));

        await waitFor(() => expect(window.StudioUISDK.connector.getState).toHaveBeenCalledWith('grafx-media'));

        await waitFor(() => {
            expect(window.StudioUISDK.connector.waitToBeReady).toHaveBeenCalledWith('grafx-media');
            expect(window.StudioUISDK.mediaConnector.download).toHaveBeenCalledTimes(2);
            expect(result.current).toEqual({
                error: null,
                previewImageUrl: 'http://url.com',
            });
        });
    });
});
