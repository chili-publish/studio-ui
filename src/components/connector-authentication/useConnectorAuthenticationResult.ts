import { ToastVariant } from '@chili-publish/grafx-shared-components';
import { useEffect } from 'react';
import { useNotificationManager } from '../../contexts/NotificantionManager/NotificationManagerContext';
import { ConnectorAuthenticationResult } from '../../types/ConnectorAuthenticationResult';

const authorizationFailedToast = (connectorName: string) => ({
    id: 'connector-authorization-failed',
    message: `Authorization failed for ${connectorName}.`,
    type: ToastVariant.NEGATIVE,
});

const authorizationFailedTimeoutToast = (connectorName: string) => ({
    id: 'connector-authorization-failed-timeout',
    message: `Authorization failed (timeout) for ${connectorName}.`,
    type: ToastVariant.NEGATIVE,
});

export const useConnectorAuthenticationResult = (
    connectorName: string,
    result: ConnectorAuthenticationResult | null,
) => {
    const { addNotification } = useNotificationManager();

    useEffect(() => {
        if (result?.type === 'error') {
            addNotification(authorizationFailedToast(connectorName));
        } else if (result?.type === 'timeout') {
            addNotification(authorizationFailedTimeoutToast(connectorName));
        }
    }, [result, connectorName, addNotification]);
};
