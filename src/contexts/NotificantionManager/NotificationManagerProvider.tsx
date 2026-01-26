import { ReactNode, useMemo } from 'react';
import useNotifications from './useNotifications';
import { NotificationManagerContext } from './NotificationManagerContext';
import NotificationComponent from './NotificationComponent';

export const NotificationManagerProvider = (props: { children: ReactNode }) => {
    const { children } = props;
    const { currentNotification, notifications, addNotification, removeNotification, removeNotifications } =
        useNotifications();
    const contextData = useMemo(
        () => ({ currentNotification, notifications, addNotification, removeNotification, removeNotifications }),
        [currentNotification, notifications, addNotification, removeNotification, removeNotifications],
    );

    return (
        <NotificationManagerContext.Provider value={contextData}>
            {children}
            <NotificationComponent currentNotification={currentNotification} removeNotification={removeNotification} />
        </NotificationManagerContext.Provider>
    );
};
