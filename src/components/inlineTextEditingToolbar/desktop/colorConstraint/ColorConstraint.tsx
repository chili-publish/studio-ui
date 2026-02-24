import { FrameConstraints } from '@chili-publish/studio-sdk';
import { ConstraintWrapper } from '../InlineTextEditingToolbar.styles';
import {
    AvailableIcons,
    Color,
    ColorUsage,
    formatColorValue,
    Icon,
    Tooltip,
    TooltipPosition,
} from '@chili-publish/grafx-shared-components';
import { useEffect, useState } from 'react';
import { ColorContainer } from './Color.styles';
import ColorPickerModal from './ColorPickerModal';
import { useAppSelector } from 'src/store';
import { selectedTextProperties } from 'src/store/reducers/frameReducer';
import { getColorValue } from './color.util';
import useColorModalPosition from './useColorModalPosition';
import { APP_WRAPPER_ID } from 'src/utils/constants';
import { getDataTestIdForSUI } from 'src/utils/dataIds';

const ColorConstraint = ({ frameConstraints }: { frameConstraints: FrameConstraints | null }) => {
    const textStyle = useAppSelector(selectedTextProperties);

    const [colorValue, setColorValue] = useState<string>('');

    const { isColorPickerOpen, colorModalPosition, openColorPicker, closeColorPicker, colorContainerRef } =
        useColorModalPosition();

    useEffect(() => {
        if (textStyle) {
            getColorValue(textStyle.color as unknown as ColorUsage).then((value) => setColorValue(value));
        }
    }, [textStyle]);

    return (
        <ConstraintWrapper>
            <Icon icon={AvailableIcons.faPalette} />

            <Tooltip
                anchorId={APP_WRAPPER_ID}
                position={TooltipPosition.BOTTOM}
                content={formatColorValue(textStyle?.color?.color as unknown as Color)}
            >
                <ColorContainer
                    ref={colorContainerRef}
                    color={colorValue}
                    onClick={openColorPicker}
                    data-testid={getDataTestIdForSUI('color-constraint-container')}
                />
            </Tooltip>

            {isColorPickerOpen && (
                <ColorPickerModal
                    frameConstraints={frameConstraints}
                    position={colorModalPosition}
                    onClose={closeColorPicker}
                />
            )}
        </ConstraintWrapper>
    );
};

export default ColorConstraint;
