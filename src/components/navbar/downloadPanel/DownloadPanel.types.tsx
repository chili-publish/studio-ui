export type DownloadFormats = 'JPG' | 'PNG' | 'MP4' | 'GIF';
export type DownloadState = {
    [key in DownloadFormats]: boolean;
};
