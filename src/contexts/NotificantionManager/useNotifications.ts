import { useCallback, useEffect, useState } from 'react';
import { Notification } from './Notification.types';
import { getPriority, insertNotification } from './notification.util';

const useNotifications = () => {
    const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        setCurrentNotification(notifications.length ? notifications[0] : null);
    }, [notifications]);

    const addNotification = (message: Notification) => {
        if (currentNotification) {
            const currentNotificationPriority = getPriority(currentNotification);
            const notificationPriority = getPriority(message);

            // new notification has higher priority
            if (notificationPriority < currentNotificationPriority) {
                removeNotification(currentNotification);
            }
        }
        setNotifications((prev) => insertNotification(message, [...prev]));
    };

    const removeNotification = useCallback((msg: Notification) => {
        setCurrentNotification(null);
        setNotifications((prev) => prev.filter((item) => item.id !== msg.id));
    }, []);

    return {
        currentNotification,
        addNotification,
        removeNotification,
        notifications,
    };
};

export default useNotifications;
