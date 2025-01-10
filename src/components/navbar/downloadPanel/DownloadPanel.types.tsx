import { AvailableIcons } from '@chili-publish/grafx-shared-components';

export type DownloadFormats = 'JPG' | 'PNG' | 'MP4' | 'GIF';
export type DownloadState = {
    [key in DownloadFormats]: boolean;
};

export const outputTypesIcons = {
    jpg: AvailableIcons.faImage,
    png: AvailableIcons.faImage,
    mp4: AvailableIcons.faFileVideo,
    gif: AvailableIcons.faGif,
    pdf: AvailableIcons.faFilePdf,
};
