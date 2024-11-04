import { ToastVariant } from '@chili-publish/grafx-shared-components';
import { useEffect, useState } from 'react';
import { useNotificationManager } from '../../contexts/NotificantionManager/NotificationManagerContext';
import { ConnectorAuthResult } from './types';

const authorizationFailedToast = (connectorName: string) => ({
    id: 'connector-authorization-failed',
    message: `Authorization failed for ${connectorName}.`,
    type: ToastVariant.NEGATIVE,
});

const authorizationFailedTimeoutToast = (connectorName: string) => ({
    id: `connector-authorization-failed-timeout-${connectorName}`,
    message: `Authorization failed (timeout) for ${connectorName}.`,
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
                    addNotification(authorizationFailedToast(notification.connectorName));
                } else if (notification.result?.type === 'timeout') {
                    addNotification(authorizationFailedTimeoutToast(notification.connectorName));
                }
                setDisplayedNotifications((prev) => [...prev, notification]);
            });
    }, [authResult, addNotification, displayedNotifications]);
};
