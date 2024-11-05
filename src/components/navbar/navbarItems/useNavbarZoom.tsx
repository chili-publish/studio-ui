import { useMemo } from 'react';
import Zoom from '../../zoom/Zoom';
import useZoom from '../../../contexts/ShortcutManager/useZoom';

const useNavbarZoom = (zoom: number) => {
    const { zoomIn, zoomOut } = useZoom(zoom);

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
