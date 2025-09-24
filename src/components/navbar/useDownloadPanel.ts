import { ToastVariant } from '@chili-publish/grafx-shared-components';
import { DownloadFormats } from '@chili-publish/studio-sdk';
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react';
import { ProjectConfig } from 'src/types/types';
import { useNotificationManager } from '../../contexts/NotificantionManager/NotificationManagerContext';
import { validateVariableList } from '../../store/reducers/variableReducer';
import { useAppDispatch } from '../../store';

const useDownloadPanel = (projectConfig: ProjectConfig, projectName: string, selectedLayoutId: string | null) => {
    const dispatch = useAppDispatch();

    const [isDownloadPanelVisible, setIsDownloadPanelVisible] = useState(false);
    const previousSelectedLayoutId = useRef<string | null>(selectedLayoutId);

    const { addNotification } = useNotificationManager();

    const hideDownloadPanel = useCallback(() => {
        setIsDownloadPanelVisible(false);
    }, []);

    const showDownloadPanel = useCallback(() => {
        setIsDownloadPanelVisible(true);
    }, []);

    const handleDownload = async (
        extension: DownloadFormats,
        updateDownloadState: Dispatch<Partial<Record<DownloadFormats, boolean>>>,
        outputSettingsId: string | undefined,
    ) => {
        const { hasErrors } = await dispatch(validateVariableList()).unwrap();

        if (hasErrors) {
            addNotification({
                id: 'variable-validation',
                message: `Fill all required fields to download.`,
                type: ToastVariant.NEGATIVE,
            });
            return;
        }
        try {
            updateDownloadState({ [extension]: true });
            const selectedLayoutID = (await window.StudioUISDK.layout.getSelected()).parsedData?.id;
            const { extensionType, outputData } = await projectConfig.onGenerateOutput(
                extension,
                selectedLayoutID,
                outputSettingsId,
            );
            // const downloadLinkData = await projectConfig.onProjectGetDownloadLink(
            //     extension,
            //     selectedLayoutID,
            //     outputSettingsId,
            // );

            // if (downloadLinkData.status !== 200) {
            //     throw new Error('Error getting download link');
            // }

            // const response = await axios.get(downloadLinkData.data ?? '', {
            //     responseType: 'blob',
            //     headers: { Authorization: `Bearer ${authToken}` },
            // });

            // if (response.status !== 200) return;

            // const contentType: MimeType = response.headers['content-type'];
            // const extensionType = mimeToExt[contentType];

            const objectUrl = window.URL.createObjectURL(outputData);
            const a = Object.assign(document.createElement('a'), {
                href: objectUrl,
                style: 'display: none',
                download: `${projectName}.${extensionType}`,
            });
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(objectUrl);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            const toastNotification = {
                id: 'document-export',
                message: `Export failed`,
                type: ToastVariant.NEGATIVE,
            };

            addNotification(toastNotification);
        } finally {
            updateDownloadState({ [extension]: false });
        }
        hideDownloadPanel();
    };

    useEffect(() => {
        if (selectedLayoutId !== previousSelectedLayoutId.current && isDownloadPanelVisible) {
            hideDownloadPanel();
        }
        previousSelectedLayoutId.current = selectedLayoutId;
    }, [selectedLayoutId, hideDownloadPanel, isDownloadPanelVisible]);

    return {
        isDownloadPanelVisible,
        showDownloadPanel,
        hideDownloadPanel,
        handleDownload,
    };
};

export default useDownloadPanel;
