import { ReactNode, useMemo } from 'react';
import useNotifications from './useNotifications';
import { NotificationManagerContext } from './NotificationManagerContext';
import NotificationComponent from './NotificationComponent';

export function NotificationManagerProvider(props: { children: ReactNode }) {
    const { children } = props;
    const { currentNotification, notifications, addNotification, removeNotification } = useNotifications();
    const contextData = useMemo(
        () => ({ currentNotification, notifications, addNotification, removeNotification }),
        [currentNotification, notifications, addNotification, removeNotification],
    );

    return (
        <NotificationManagerContext.Provider value={contextData}>
            {children}
            <NotificationComponent currentNotification={currentNotification} removeNotification={removeNotification} />
        </NotificationManagerContext.Provider>
    );
}
