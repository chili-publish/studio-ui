import { ToastVariant } from '@chili-publish/grafx-shared-components';

export interface Notification {
    id: string;
    dataId?: string;
    message: string;
    action?: { label: string; callback: () => void };
    duration?: number;
    type: ToastVariant;
}

export interface INotificationComponent {
    currentNotification: Notification | null;
    removeNotification: (msg: Notification) => void;
}
