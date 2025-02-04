import {
    ColorType,
    ColorUsageType,
    Layout,
    LayoutIntent,
    LayoutListItemType,
    LayoutType,
    MeasurementUnit,
} from '@chili-publish/studio-sdk';

export const mockLayout: Layout = {
    id: '1',
    name: 'print',
    displayName: null,
    privateData: {},
    parentId: '0',
    width: {
        value: 246.94444444444443,
        isOverride: false,
        isReadOnly: false,
    },
    height: {
        value: 246.94444444444443,
        isOverride: false,
        isReadOnly: false,
    },
    childLayouts: [],
    timelineLengthMs: {
        value: 5000,
        isOverride: false,
        isReadOnly: false,
    },
    unit: {
        value: MeasurementUnit.mm,
        isOverride: true,
        isReadOnly: false,
    },
    intent: {
        value: LayoutIntent.print,
        isOverride: true,
        isReadOnly: false,
    },
    fillColor: {
        value: {
            color: {
                r: 255,
                g: 255,
                b: 255,
                type: ColorType.rgb,
            },
            opacity: 1,
            type: ColorUsageType.local,
        },
        isOverride: true,
        isReadOnly: false,
    },
    fillColorEnabled: {
        value: false,
        isOverride: true,
        isReadOnly: false,
    },
    bleed: {
        value: {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            areBleedValuesCombined: true,
        },
        isOverride: true,
        isReadOnly: false,
    },
    availableForUser: true,
};
export const mockLayouts: LayoutListItemType[] = [
    {
        id: '0',
        name: 'Default',
        displayName: null,
        type: LayoutType.top,
        availableForUser: false,
        parentId: null,
        childLayouts: ['1', '2'],
    },
    {
        id: '1',
        name: 'L1',
        displayName: 'L1 display name',
        type: LayoutType.child,
        availableForUser: true,
        parentId: '0',
        childLayouts: [],
    },
    {
        id: '2',
        name: 'L2',
        displayName: null,
        type: LayoutType.child,
        availableForUser: true,
        parentId: '0',
        childLayouts: [],
    },
    {
        id: '3',
        name: 'L3',
        displayName: 'L3 display name',
        type: LayoutType.child,
        availableForUser: true,
        parentId: '0',
        childLayouts: [],
    },
];
