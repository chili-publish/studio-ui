import { DocumentColor, FrameConstraints, SelectedTextStyles, TextStyleUpdateType } from '@chili-publish/studio-sdk';
import { useEffect, useState } from 'react';
import { toColorPickerColor } from '../desktop/colorConstraint/color.util';
import { ColorGridType } from '@chili-publish/grafx-shared-components';

const useAllowedColorStyles = (frameConstraints: FrameConstraints | null) => {
    const [colors, setColors] = useState<DocumentColor[]>([]);

    useEffect(() => {
        const colorIds = frameConstraints?.text?.colors.value.ids ?? [];
        if (colorIds.length > 0) {
            const fetchColors = async () => {
                const colorsData = await Promise.all(colorIds.map((id) => window.StudioUISDK.colorStyle.getById(id)));
                setColors(colorsData.map((data) => data.parsedData).filter((data) => data !== null));
            };
            fetchColors();
        }
    }, [frameConstraints]);

    const colorGridColors = colors.map((color) => ({
        colorValue: toColorPickerColor(color),
        name: color.name,
        id: color.id,
    }));

    const handleColorSelection = async (color: ColorGridType) => {
        await window.StudioUISDK.textSelection.set({
            [SelectedTextStyles.COLOR]: { value: color.colorValue },
        } as TextStyleUpdateType);
    };

    return {
        colorGridColors,
        handleColorSelection,
    };
};

export default useAllowedColorStyles;
