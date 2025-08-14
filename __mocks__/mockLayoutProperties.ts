import {
    ColorType,
    ColorUsageType,
    LayoutIntent,
    LayoutPropertiesType,
    MeasurementUnit,
} from '@chili-publish/studio-sdk';

export const mockLayoutProperties: LayoutPropertiesType = {
    id: '1',
    name: 'Layout 1',
    displayName: 'Layout 1',
    width: { value: 100, isOverride: false, isReadOnly: false },
    height: { value: 100, isOverride: false, isReadOnly: false },
    animated: { value: false, isOverride: false, isReadOnly: false },
    intent: { value: LayoutIntent.digitalStatic, isOverride: false, isReadOnly: false },
    unit: { value: MeasurementUnit.px, isOverride: false, isReadOnly: false },
    fillColor: {
        value: { type: ColorUsageType.local, color: { type: ColorType.rgb, r: 255, g: 255, b: 255 } },
        isOverride: false,
        isReadOnly: false,
    },
    fillColorEnabled: { value: true, isOverride: false, isReadOnly: false },
    bleed: { value: undefined, isOverride: false, isReadOnly: false },
    availableForUser: true,
    selectedByUser: true,
    timelineLengthMs: { value: 5000, isOverride: false, isReadOnly: false },
    resizableByUser: {
        enabled: true,
        minWidth: 100,
        maxWidth: 1000,
        minHeight: 100,
        maxHeight: 1000,
    },
};
