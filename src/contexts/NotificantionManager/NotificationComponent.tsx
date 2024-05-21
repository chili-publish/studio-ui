import { Toast, ToastVariant } from '@chili-publish/grafx-shared-components';
import { NotificationWrapper } from './Notification.styles';
import { useNotificationManager } from './NotificationManagerContext';

const DEFAULT_NOTIFICATION_DURATION = 5000;

function NotificationComponent() {
    const { currentNotification, removeNotification } = useNotificationManager();
    return (
        <NotificationWrapper>
            <Toast
                key={currentNotification?.id}
                visible={!!currentNotification}
                time={currentNotification?.duration ?? DEFAULT_NOTIFICATION_DURATION}
                type={currentNotification?.type ?? ToastVariant.NEUTRAL}
                content={currentNotification?.message || ''}
                action={currentNotification?.action}
                onClose={() => (currentNotification ? removeNotification(currentNotification) : null)}
            />
        </NotificationWrapper>
    );
}

export default NotificationComponent;
