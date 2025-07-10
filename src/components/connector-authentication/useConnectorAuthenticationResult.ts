import { ToastVariant } from '@chili-publish/grafx-shared-components';
import { useCallback, useEffect, useState } from 'react';
import { useNotificationManager } from '../../contexts/NotificantionManager/NotificationManagerContext';
import { useUITranslations } from '../../core/hooks/useUITranslations';
import { ConnectorAuthResult } from './types';

export const useConnectorAuthenticationResult = (authResult: ConnectorAuthResult[]) => {
    const [displayedNotifications, setDisplayedNotifications] = useState<ConnectorAuthResult[]>([]);

    const { addNotification } = useNotificationManager();
    const { getUITranslation } = useUITranslations();

    const authorizationFailedToast = useCallback(
        (connector: ConnectorAuthResult) => ({
            id: `connector-authorization-failed-${connector.remoteConnectorId}`,
            message: getUITranslation(
                ['toast', 'connectorAuthorization', 'error'],
                `Authorization failed for "${connector.connectorName}" connector.`,
                { connectorName: connector.connectorName },
            ),
            type: ToastVariant.NEGATIVE,
        }),
        [getUITranslation],
    );

    const authorizationFailedTimeoutToast = useCallback(
        (connector: ConnectorAuthResult) => ({
            id: `connector-authorization-failed-timeout-${connector.remoteConnectorId}`,
            message: getUITranslation(
                ['toast', 'connectorAuthorization', 'timeoutError'],
                `Authorization failed (timeout) for "${connector.connectorName}" connector.`,
                { connectorName: connector.connectorName },
            ),
            type: ToastVariant.NEGATIVE,
        }),
        [getUITranslation],
    );

    useEffect(() => {
        authResult
            .filter((authNotification) => !displayedNotifications.some((item) => item === authNotification))
            .forEach((notification) => {
                if (notification.result?.type === 'error') {
                    addNotification(authorizationFailedToast(notification));
                } else if (notification.result?.type === 'timeout') {
                    addNotification(authorizationFailedTimeoutToast(notification));
                }
                setDisplayedNotifications((prev) => [...prev, notification]);
            });
    }, [
        authResult,
        addNotification,
        displayedNotifications,
        authorizationFailedToast,
        authorizationFailedTimeoutToast,
    ]);
};
