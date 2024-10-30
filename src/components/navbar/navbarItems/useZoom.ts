import { useCallback } from 'react';

const useZoom = (zoom: number) => {
    const zoomIn = useCallback(async () => {
        (async () => {
            // 1.142 is the same value used in the engine to zoom in
            await window.StudioUISDK.canvas.setZoomPercentage(zoom * 1.142);
        })();
    }, [zoom]);

    const zoomOut = useCallback(async () => {
        (async () => {
            // 0.875 is the same value used in the engine to zoom out
            await window.StudioUISDK.canvas.setZoomPercentage(zoom * 0.875);
        })();
    }, [zoom]);

    return {
        zoomIn,
        zoomOut,
    };
};

export default useZoom;
