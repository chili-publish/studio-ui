import { renderHook, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { act } from 'react-dom/test-utils';
import { usePreviewImageUrl } from '../../../../components/variablesComponents/imageVariable/usePreviewImageUrl';

jest.mock('@chili-publish/grafx-shared-components', () => ({
    usePreviewImageUrl: jest.fn((_, previewCall) => {
        const [url, setUrl] = useState<string | null>(null);
        useEffect(() => {
            (async () => {
                const result = await previewCall(_).then((res: string | null) => res);
                return !result ? setUrl(result) : setUrl('http://url.com');
            })();
        }, [_, previewCall]);
        return url;
    }),
}));

describe('"usePreviewImageUrl" hook', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should not call "download" if no connector is provided', () => {
        window.StudioUISDK.mediaConnector.download = jest.fn().mockResolvedValueOnce(new Uint8Array());
        const { result } = renderHook(() => usePreviewImageUrl(undefined, 'media-asset-id', undefined));

        act(() => {
            expect(window.StudioUISDK.mediaConnector.download).not.toHaveBeenCalled();
            expect(result.current).toEqual(null);
        });
    });

    it('should call "download" with "ready" state check', async () => {
        window.StudioUISDK.mediaConnector.download = jest.fn().mockRejectedValueOnce('Random Error');
        window.StudioUISDK.connector.getState = jest.fn().mockResolvedValueOnce({
            parsedData: {
                type: 'ready',
            },
        });
        const { result } = renderHook(() => usePreviewImageUrl('grafx-media', 'media-asset-id', undefined));

        await waitFor(() => expect(window.StudioUISDK.connector.getState).toHaveBeenCalledWith('grafx-media'));

        act(() => {
            expect(window.StudioUISDK.connector.waitToBeReady).not.toHaveBeenCalled();
            expect(window.StudioUISDK.mediaConnector.download).toHaveBeenCalledTimes(1);
            expect(result.current).toEqual(null);
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
        const { result } = renderHook(() => usePreviewImageUrl('grafx-media', 'media-asset-id', undefined));

        await waitFor(() => expect(window.StudioUISDK.connector.getState).toHaveBeenCalledWith('grafx-media'));

        act(() => {
            expect(window.StudioUISDK.connector.waitToBeReady).toHaveBeenCalledWith('grafx-media');
            expect(window.StudioUISDK.mediaConnector.download).toHaveBeenCalledTimes(2);
            expect(result.current).toEqual('http://url.com');
        });
    });
});
