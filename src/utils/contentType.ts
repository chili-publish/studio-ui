export type ContentType =
    | 'image/png'
    | 'image/jpeg'
    | 'application/pdf'
    | 'application/zip'
    | 'video/mp4'
    | 'image/gif';
const mimeToExt: { [key in ContentType]: string } = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'application/pdf': 'pdf',
    'application/zip': 'zip',
    'video/mp4': 'mp4',
    'image/gif': 'gif',
};

export function contentTypeToExtension(mimeType: ContentType): string {
    return mimeToExt[mimeType];
}
