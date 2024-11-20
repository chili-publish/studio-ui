import { ToastVariant } from '@chili-publish/grafx-shared-components';
import { DownloadFormats } from '@chili-publish/studio-sdk';
import axios from 'axios';
import { Dispatch, useState } from 'react';
import { ProjectConfig } from 'src/types/types';
import { useNotificationManager } from '../../contexts/NotificantionManager/NotificationManagerContext';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { useAuthToken } from '../../contexts/AuthTokenProvider';

const useDownloadPanel = (projectConfig: ProjectConfig) => {
    const { authToken } = useAuthToken();
    const [isDownloadPanelVisible, setIsDownloadPanelVisible] = useState(false);

    const { validateVariables } = useVariablePanelContext();
    const { addNotification } = useNotificationManager();

    const hideDownloadPanel = () => {
        setIsDownloadPanelVisible(false);
    };

    const showDownloadPanel = () => {
        setIsDownloadPanelVisible(true);
    };

    const handleDownload = async (
        extension: DownloadFormats,
        updateDownloadState: Dispatch<Partial<Record<DownloadFormats, boolean>>>,
        outputSettingsId: string | undefined,
    ) => {
        const hasErrors = validateVariables();
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
            const downloadLinkData = await projectConfig.onProjectGetDownloadLink(
                extension,
                selectedLayoutID,
                outputSettingsId,
            );
            if (downloadLinkData.status !== 200) {
                throw new Error('Error getting download link');
            }
            const response = await axios.get(downloadLinkData.data ?? '', {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.status !== 200) return;

            const objectUrl = window.URL.createObjectURL(response.data);
            const a = Object.assign(document.createElement('a'), {
                href: objectUrl,
                style: 'display: none',
                download: `export.${extension}`,
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

    return {
        isDownloadPanelVisible,
        showDownloadPanel,
        hideDownloadPanel,
        handleDownload,
    };
};

export default useDownloadPanel;
