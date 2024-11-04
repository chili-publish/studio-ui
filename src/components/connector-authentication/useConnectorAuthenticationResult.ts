import { ToastVariant } from '@chili-publish/grafx-shared-components';
import { useEffect, useState } from 'react';
import { useNotificationManager } from '../../contexts/NotificantionManager/NotificationManagerContext';
import { ConnectorAuthResult } from './types';

const authorizationFailedToast = (connector: ConnectorAuthResult) => ({
    id: `connector-authorization-failed-${connector.connectorId}`,
    message: `Authorization failed for ${connector.connectorName}.`,
    type: ToastVariant.NEGATIVE,
});

const authorizationFailedTimeoutToast = (connector: ConnectorAuthResult) => ({
    id: `connector-authorization-failed-timeout-${connector.connectorId}`,
    message: `Authorization failed (timeout) for ${connector.connectorName}.`,
    type: ToastVariant.NEGATIVE,
});

export const useConnectorAuthenticationResult = (authResult: ConnectorAuthResult[]) => {
    const [displayedNotifications, setDisplayedNotifications] = useState<ConnectorAuthResult[]>([]);

    const { addNotification } = useNotificationManager();

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
    }, [authResult, addNotification, displayedNotifications]);
};
