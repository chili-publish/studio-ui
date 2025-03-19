export enum OutputSettingFormats {
    JPG = 'JPG',
    PNG = 'PNG',
    MP4 = 'MP4',
    GIF = 'GIF',
    PDF = 'PDF',
}

export type OutputSettings = {
    id: string;
    name: string;
    description: string;
    type: OutputSettingFormats;
    dataSourceEnabled: boolean;
};
