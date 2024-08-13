import { Toast, ToastVariant } from '@chili-publish/grafx-shared-components';
import { NotificationWrapper } from './Notification.styles';
import { INotificationComponent } from './Notification.types';

const DEFAULT_NOTIFICATION_DURATION = 50000;

function NotificationComponent(props: INotificationComponent) {
    const { currentNotification, removeNotification } = props;
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
