export type DownloadFormats = 'JPG' | 'PNG' | 'MP4' | 'GIF' | 'PDF';
export type DownloadState = {
    [key in DownloadFormats]: boolean;
};
