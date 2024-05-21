import { ToastVariant } from '@chili-publish/grafx-shared-components';

export interface Notification {
    id: string;
    message: string;
    action?: { label: string; callback: () => void };
    duration?: number;
    type: ToastVariant;
}
