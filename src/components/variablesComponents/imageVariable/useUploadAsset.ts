import { Media } from '@chili-publish/studio-sdk';
import { useCallback, useState } from 'react';

export const uploadFileMimeTypes = ['image/jpg', 'image/jpeg', 'image/png'];

export const useUploadAsset = (connectorId: string | undefined) => {
    const [pending, setPending] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>();

    const upload = useCallback(
        async (files: File[]): Promise<Media | null> => {
            if (!connectorId) {
                return null;
            }
            try {
                setPending(true);
                setErrorMsg(undefined);
                // eslint-disable-next-line no-console
                console.warn('Upload will be implemented in the future', connectorId, files);
                return null;
                // TODO: Asset upload - Uncomment after https://chilipublishintranet.atlassian.net/browse/EDT-1952
                // 1. Stage selected files
                // const filePointers = await window.StudioUISDK.utils.stageFiles(files, connectorId, {
                //     mimeTypes: uploadFileMimeTypes,
                // });

                // // 2. Upload files through the connector
                // const media = await window.StudioUISDK.mediaConnector.upload(connectorId, filePointers);

                // return media;
            } catch (error) {
                // TODO: Asset upload - Uncomment after https://chilipublishintranet.atlassian.net/browse/EDT-1952. Error type should be exported from SDK package
                // setErrorMsg(error instanceof AssetStageError ? error.message : 'Something went wrong.');
                return null;
            } finally {
                setPending(false);
            }
        },
        [connectorId],
    );

    return {
        upload,
        pending,
        errorMsg,
    };
};
