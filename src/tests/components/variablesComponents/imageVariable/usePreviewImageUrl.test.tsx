import { waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { usePreviewImageUrl } from '../../../../components/variablesComponents/imageVariable/usePreviewImageUrl';
import { renderHookWithProviders } from '@tests/mocks/Provider';
import { ConnectorHttpError } from '@chili-publish/studio-sdk';

jest.mock('@chili-publish/grafx-shared-components', () => {
    const original = jest.requireActual('@chili-publish/grafx-shared-components');
    return {
        ...original,
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
    };
});

jest.mock('@chili-publish/studio-sdk', () => jest.requireActual('@chili-publish/studio-sdk'));

describe('"usePreviewImageUrl" hook', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should not call "download" if no connector is provided', () => {
        window.StudioUISDK.mediaConnector.download = jest.fn().mockResolvedValueOnce(new Uint8Array());
        const { result } = renderHookWithProviders(() => usePreviewImageUrl(undefined, 'media-asset-id'));

        expect(window.StudioUISDK.mediaConnector.download).not.toHaveBeenCalled();
        expect(result.current).toEqual({ previewImageUrl: null });
    });

    it('should call "download" in a normal flow', async () => {
        window.StudioUISDK.mediaConnector.download = jest.fn().mockResolvedValueOnce(new Uint8Array());
        window.StudioUISDK.connector.getState = jest.fn();
        const { result } = renderHookWithProviders(() => usePreviewImageUrl('grafx-media', 'media-asset-id'));

        await waitFor(() => {
            expect(result.current).toEqual({
                previewImageUrl: 'http://url.com',
            });
        });

        expect(window.StudioUISDK.connector.getState).not.toHaveBeenCalledWith('grafx-media');
        expect(window.StudioUISDK.connector.waitToBeReady).not.toHaveBeenCalledWith('grafx-media');
        expect(window.StudioUISDK.mediaConnector.download).toHaveBeenCalledTimes(1);
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
        const { result } = renderHookWithProviders(() => usePreviewImageUrl('grafx-media', 'media-asset-id'));

        await waitFor(() => expect(window.StudioUISDK.connector.getState).toHaveBeenCalledWith('grafx-media'));

        expect(window.StudioUISDK.connector.waitToBeReady).toHaveBeenCalledWith('grafx-media');
        expect(window.StudioUISDK.mediaConnector.download).toHaveBeenCalledTimes(2);
        expect(result.current).toEqual({
            previewImageUrl: 'http://url.com',
        });
    });

    it('should throw "Unauthorized asset" error', async () => {
        window.StudioUISDK.mediaConnector.download = jest.fn().mockRejectedValueOnce(new ConnectorHttpError(401));
        window.StudioUISDK.connector.getState = jest.fn().mockResolvedValueOnce({
            parsedData: {
                type: 'ready',
            },
        });

        const { result } = renderHookWithProviders(() => usePreviewImageUrl('grafx-media', 'media-asset-id'));

        await waitFor(() => expect(window.StudioUISDK.connector.getState).toHaveBeenCalledWith('grafx-media'));

        expect(window.StudioUISDK.connector.waitToBeReady).not.toHaveBeenCalled();
        expect(window.StudioUISDK.mediaConnector.download).toHaveBeenCalledTimes(1);
        await waitFor(() => {
            expect(result.current).toEqual(
                expect.objectContaining({
                    previewError: 'Unauthorized asset',
                    previewImageUrl: null,
                }),
            );
        });
    });

    it('should throw "Asset is missing." error', async () => {
        window.StudioUISDK.mediaConnector.download = jest.fn().mockRejectedValueOnce(new ConnectorHttpError(404));
        window.StudioUISDK.connector.getState = jest.fn().mockResolvedValueOnce({
            parsedData: {
                type: 'ready',
            },
        });

        const { result } = renderHookWithProviders(() => usePreviewImageUrl('grafx-media', 'media-asset-id'));

        await waitFor(() => expect(window.StudioUISDK.connector.getState).toHaveBeenCalledWith('grafx-media'));

        expect(window.StudioUISDK.connector.waitToBeReady).not.toHaveBeenCalled();
        expect(window.StudioUISDK.mediaConnector.download).toHaveBeenCalledTimes(1);
        await waitFor(() => {
            expect(result.current).toEqual(
                expect.objectContaining({
                    previewError: 'Asset is missing.',
                    previewImageUrl: null,
                }),
            );
        });
    });

    it('should throw "Unable to load." error', async () => {
        window.StudioUISDK.mediaConnector.download = jest.fn().mockRejectedValueOnce('Random Error');
        window.StudioUISDK.connector.getState = jest.fn().mockResolvedValueOnce({
            parsedData: {
                type: 'ready',
            },
        });

        const { result } = renderHookWithProviders(() => usePreviewImageUrl('grafx-media', 'media-asset-id'));

        await waitFor(() => expect(window.StudioUISDK.connector.getState).toHaveBeenCalledWith('grafx-media'));

        expect(window.StudioUISDK.connector.waitToBeReady).not.toHaveBeenCalled();
        expect(window.StudioUISDK.mediaConnector.download).toHaveBeenCalledTimes(1);
        await waitFor(() => {
            expect(result.current).toEqual(
                expect.objectContaining({
                    previewError: 'Unable to load.',
                    previewImageUrl: null,
                }),
            );
        });
    });
});
