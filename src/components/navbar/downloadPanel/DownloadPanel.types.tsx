import { AvailableIcons } from '@chili-publish/grafx-shared-components';
import { DownloadFormats } from '@chili-publish/studio-sdk';

export const outputTypesIcons = {
    [DownloadFormats.JPG]: AvailableIcons.faImage,
    [DownloadFormats.PNG]: AvailableIcons.faImage,
    [DownloadFormats.MP4]: AvailableIcons.faFileVideo,
    [DownloadFormats.GIF]: AvailableIcons.faGif,
    [DownloadFormats.PDF]: AvailableIcons.faFilePdf,
    [DownloadFormats.HTML]: AvailableIcons.solidFaGlobe,
};
