import { AvailableIcons, Button, ButtonVariant, Icon } from '@chili-publish/grafx-shared-components';
import { useEffect, useState } from 'react';
import { ZoomButtonProps, ZoomTypeEnum } from './Zoom.types';
import { NavbarGroup, NavbarText } from '../navbar/Navbar.styles';

const ZoomButton = (props: ZoomButtonProps) => {
    const { type, handleOnClick } = props;
    const isDecrement = type === ZoomTypeEnum.DECREMENT;
    const ariaLabel = `Zoom ${isDecrement ? 'out' : 'in'}`;

    return (
        <Button
            variant={ButtonVariant.tertiary}
            onClick={() => handleOnClick(type)}
            icon={
                <Icon key={`icon-${ariaLabel}`} icon={isDecrement ? AvailableIcons.faMinus : AvailableIcons.faPlus} />
            }
        />
    );
};

interface IZoom {
    zoomIn: () => Promise<void>;
    zoomOut: () => Promise<void>;
    zoom: number;
}
const Zoom = (props: IZoom) => {
    const { zoom, zoomIn, zoomOut } = props;

    const [currentZoom, setCurrentZoom] = useState(zoom);

    useEffect(() => {
        setCurrentZoom(zoom);
    }, [zoom]);

    // const zoomIn = async () => {
    //     await window.StudioUISDK.canvas.setZoomPercentage(currentZoom * 1.142);
    // };

    // const zoomOut = async () => {
    //     await window.StudioUISDK.canvas.setZoomPercentage(currentZoom * 0.875);
    // };

    return (
        <NavbarGroup withGap data-testid="zoom">
            <ZoomButton type={ZoomTypeEnum.DECREMENT} handleOnClick={zoomOut} />
            <NavbarText aria-label="zoom level">{currentZoom}%</NavbarText>
            <ZoomButton handleOnClick={zoomIn} />
        </NavbarGroup>
    );
};

export default Zoom;
