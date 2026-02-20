import { DocumentColor, Id } from '@chili-publish/studio-sdk';
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

const ColorConstraint = ({ colorIds }: { colorIds: Id[] }) => {
    const [colors, setColors] = useState<DocumentColor[]>([]);

    const textStyle = useAppSelector(selectedTextProperties);
    const [colorValue, setColorValue] = useState<string>('');
    const { isColorPickerOpen, colorModalPosition, openColorPicker, closeColorPicker, colorContainerRef } =
        useColorModalPosition();

    useEffect(() => {
        if (colorIds.length > 0) {
            const fetchColors = async () => {
                const colorsData = await Promise.all(colorIds.map((id) => window.StudioUISDK.colorStyle.getById(id)));
                setColors(colorsData.map((data) => data.parsedData).filter((data) => data !== null));
            };
            fetchColors();
        }
    }, [colorIds]);

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
                <ColorContainer ref={colorContainerRef} color={colorValue} onClick={openColorPicker} />
            </Tooltip>

            {isColorPickerOpen && (
                <ColorPickerModal colors={colors} position={colorModalPosition} onClose={closeColorPicker} />
            )}
        </ConstraintWrapper>
    );
};

export default ColorConstraint;
