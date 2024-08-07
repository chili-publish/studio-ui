import { ToastVariant } from '@chili-publish/grafx-shared-components';
import { useEffect } from 'react';
import { useNotificationManager } from '../../contexts/NotificantionManager/NotificationManagerContext';
import { ConnectorAuthenticationResult } from '../../types/ConnectorAuthenticationResult';

const authorizationFailedToast = {
    id: 'connector-authorization-failed',
    message: `Authorization failed`,
    type: ToastVariant.NEGATIVE,
};

const authorizationFailedTimeoutToast = {
    id: 'connector-authorization-failed-timeout',
    message: `Authorization failed (timeout)`,
    type: ToastVariant.NEGATIVE,
};

export const useConnectorAuthenticationResult = (result: ConnectorAuthenticationResult | null) => {
    const { addNotification } = useNotificationManager();

    useEffect(() => {
        if (result?.type === 'error') {
            addNotification(authorizationFailedToast);
        } else if (result?.type === 'timeout') {
            addNotification(authorizationFailedTimeoutToast);
        }
    }, [result, addNotification]);
};
