import { AvailableIcons, Button, ButtonTypes, Icon } from '@chili-publish/grafx-shared-components';
import { useState } from 'react';
import { ZoomButtonProps, ZoomTypeEnum } from './Zoom.types';
import { ZoomValue } from './Zoom.styles';
import { NavbarGroup } from '../navbar/Navbar.styles';

function ZoomButton(props: ZoomButtonProps) {
    const { type, handleOnClick } = props;
    return (
        <Button
            aria-label={type === ZoomTypeEnum.DECREMENT ? 'zoom out' : 'zoom in'}
            type="button"
            buttonType={ButtonTypes.tertiary}
            onClick={() => handleOnClick(type)}
            icon={<Icon icon={type === ZoomTypeEnum.DECREMENT ? AvailableIcons.faMinus : AvailableIcons.faPlus} />}
            noPadding
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
        <NavbarGroup withGap>
            <ZoomButton type={ZoomTypeEnum.DECREMENT} handleOnClick={handleOnClick} />
            <ZoomValue aria-label="zoom level">{zoom}%</ZoomValue>
            <ZoomButton handleOnClick={handleOnClick} />
        </NavbarGroup>
    );
}

export default Zoom;
