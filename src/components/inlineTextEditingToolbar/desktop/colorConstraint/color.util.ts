import { Color, ColorUsage, convertColor } from '@chili-publish/grafx-shared-components';
import { ColorUsageUpdate, DocumentColor, ColorUsageType } from '@chili-publish/studio-sdk';

export const getColorValue = async (color: ColorUsage): Promise<string> => {
    if (!color.color) return '';
    const colorValue = await convertColor(color.color.type, color.color);
    return colorValue.hex.value;
};

export const toColorPickerColor = (color: DocumentColor): ColorUsage => {
    const colorUsage = {
        id: color.id,
        color: color.color as unknown as Color,
    } as unknown as ColorUsage;
    return colorUsage;
};

export const toColor = (color: ColorUsage): ColorUsageUpdate => {
    return {
        ...color,
        type: ColorUsageType.brandKit,
    } as unknown as ColorUsageUpdate;
};
