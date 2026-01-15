import { ToastVariant } from '@chili-publish/grafx-shared-components';
import { Notification } from './Notification.types';

const notificationTypes = [
    { type: ToastVariant.NEGATIVE, action: true }, // priority 1
    { type: ToastVariant.NEGATIVE, action: false }, // priority 2
    { type: ToastVariant.POSITIVE, action: true }, // priority 3
    { type: ToastVariant.INFORMATIVE, action: true }, // priority 4
    { type: ToastVariant.POSITIVE, action: false }, // priority 6
    { type: ToastVariant.INFORMATIVE, action: false }, // priority 7
];

/*
    Returns the notification's priority.
    The priority is defined below:
        NEGATIVE notification with action
        NEGATIVE notification
        POSITIVE notification with action
        INFORMATIVE notification with action
        POSITIVE notification
        INFORMATIVE notification
*/
export const getPriority = (notification: Notification): number => {
    const index = notificationTypes.findIndex(
        (item) => item.type === notification.type && item.action === !!notification.action,
    );

    return index >= 0 ? index + 1 : 8;
};

export const insertNotification = (notification: Notification, notifications: Notification[]): Notification[] => {
    const notificationPriority = getPriority(notification);
    const position = notifications.findIndex((item) => notificationPriority < getPriority(item));

    if (position >= 0) {
        return [...notifications.slice(0, position), notification, ...notifications.slice(position)];
    }
    return [...notifications, notification];
};
