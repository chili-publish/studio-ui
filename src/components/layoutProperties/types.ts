export enum PagePropertyType {
    Width = 'width',
    Height = 'height',
}

export type PageInputId = 'page-width-input' | 'page-height-input';

export const PagePropertyMap: Record<PageInputId, PagePropertyType> = {
    'page-width-input': PagePropertyType.Width,
    'page-height-input': PagePropertyType.Height,
};
