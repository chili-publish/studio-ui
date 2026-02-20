import { Color, ColorUsage, ColorUsageTypeEnum, convertColor } from '@chili-publish/grafx-shared-components';
import { DocumentColor } from '@chili-publish/studio-sdk';

export const getColorValue = async (color: ColorUsage): Promise<string> => {
    if (!color.color) return '';
    const colorValue = await convertColor(color.color.type, color.color);
    return colorValue.hex.value;
};

export const toColorPickerColor = (color: DocumentColor): ColorUsage => {
    const colorUsage = {
        id: color.id,
        type: ColorUsageTypeEnum.local,
        color: color.color as unknown as Color,
    };
    return colorUsage;
};
