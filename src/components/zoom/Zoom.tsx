import { AvailableIcons, Button, ButtonVariant, Icon } from '@chili-publish/grafx-shared-components';
import { useState } from 'react';
import { ZoomButtonProps, ZoomTypeEnum } from './Zoom.types';
import { ZoomValue } from './Zoom.styles';
import { NavbarGroup } from '../navbar/Navbar.styles';

function ZoomButton(props: ZoomButtonProps) {
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
}

function Zoom() {
    const [zoom, setZoom] = useState(100);

    const handleOnClick = (type: ZoomTypeEnum = ZoomTypeEnum.INCREMENT) => {
        // eslint-disable-next-line no-console
        console.log(`[${Zoom.name}] Clicked`);

        if (type === ZoomTypeEnum.DECREMENT) return setZoom(zoom - 10);

        return setZoom(zoom + 10);
    };

    return (
        <NavbarGroup withGap data-testid="zoom">
            <ZoomButton type={ZoomTypeEnum.DECREMENT} handleOnClick={handleOnClick} />
            <ZoomValue aria-label="zoom level">{zoom}%</ZoomValue>
            <ZoomButton handleOnClick={handleOnClick} />
        </NavbarGroup>
    );
}

export default Zoom;
