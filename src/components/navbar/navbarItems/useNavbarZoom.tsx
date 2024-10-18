import { useCallback, useMemo } from 'react';
import Zoom from '../../zoom/Zoom';

const useNavbarZoom = (zoom: number) => {
    const zoomIn = useCallback(async () => {
        (async () => {
            // 1.142 is the same value used in the engine to zoom in
            await window.SDK.canvas.setZoomPercentage(zoom * 1.142);
        })();
    }, [zoom]);

    const zoomOut = useCallback(async () => {
        (async () => {
            // 0.875 is the same value used in the engine to zoom out
            await window.SDK.canvas.setZoomPercentage(zoom * 0.875);
        })();
    }, [zoom]);

    const navbarItem = useMemo(
        () => ({
            label: 'Zoom',
            content: <Zoom zoom={zoom} zoomIn={zoomIn} zoomOut={zoomOut} />,
            hideOnMobile: true,
        }),
        [zoom, zoomIn, zoomOut],
    );

    return {
        zoomNavbarItem: navbarItem,
    };
};

export default useNavbarZoom;
