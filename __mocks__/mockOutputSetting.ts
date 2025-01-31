import { DownloadFormats } from '@chili-publish/studio-sdk';

export const mockOutputSetting = {
    id: '1',
    name: 'GIF',
    type: DownloadFormats.GIF,
    description: 'description',
    fps: 30,
    maxFileSizeInKiloBytes: 120,
    scaling: 1.5,
    watermark: true,
    dataSourceEnabled: false,
};

export const mockOutputSetting2 = {
    id: '2',
    name: 'JPG',
    type: DownloadFormats.JPG,
    description: 'JPG description',
    fps: 30,
    maxFileSizeInKiloBytes: 120,
    scaling: 1.5,
    watermark: true,
    dataSourceEnabled: false,
};
