import { ToastVariant } from '@chili-publish/grafx-shared-components';
import { useCallback } from 'react';
import { useNotificationManager } from '../../contexts/NotificantionManager/NotificationManagerContext';
import { ConnectorAuthResult } from './types';

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

export const useConnectorAuthenticationResult = () => {
    const { addNotification } = useNotificationManager();

    const showAuthNotification = useCallback(
        (authResult: ConnectorAuthResult) => {
            if (!authResult) return;

            if (authResult.result?.type === 'error') {
                addNotification(authorizationFailedToast(authResult.connectorName));
            } else if (authResult.result?.type === 'timeout') {
                addNotification(authorizationFailedTimeoutToast(authResult.connectorName));
            }
        },
        [addNotification],
    );

    return {
        showAuthNotification,
    };
};
