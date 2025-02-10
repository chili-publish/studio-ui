export enum LayoutPropertyType {
    Width = 'width',
    Height = 'height',
}

export type LayoutInputId = 'layout-width-input' | 'layout-height-input';

export const LayoutPropertyMap: Record<LayoutInputId, LayoutPropertyType> = {
    'layout-width-input': LayoutPropertyType.Width,
    'layout-height-input': LayoutPropertyType.Height,
};
