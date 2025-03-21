import { createContext, useContext } from 'react';
import { Notification } from './Notification.types';

export interface NotificationManager {
    currentNotification: Notification | null;
    notifications: Notification[];
    addNotification: (_: Notification) => void;
    removeNotification: (_: Notification) => void;
    removeNotifications: (idRegex: string) => void;
}

export const defaultValues: NotificationManager = {
    currentNotification: null,
    notifications: [],
    addNotification: () => null,
    removeNotification: () => null,
    removeNotifications: () => null,
};

export const NotificationManagerContext = createContext<NotificationManager>(defaultValues);

// Be aware that the notifications should have an unique ID when are submitted to the notification manager.
// Otherwise when a notification with a given ID is marked for removal, all notifications having that ID will be removed.
export const useNotificationManager = () => {
    return useContext(NotificationManagerContext);
};
