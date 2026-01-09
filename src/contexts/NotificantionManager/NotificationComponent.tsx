import { Toast, ToastVariant } from '@chili-publish/grafx-shared-components';
import { useDirection } from 'src/hooks/useDirection';
import { NotificationWrapper } from './Notification.styles';
import { INotificationComponent, TOAST_ID } from './Notification.types';

const DEFAULT_NOTIFICATION_DURATION = 5000;

function NotificationComponent(props: INotificationComponent) {
    const { currentNotification, removeNotification } = props;
    const { direction } = useDirection();
    return (
        <NotificationWrapper>
            <Toast
                id={TOAST_ID}
                dataId={currentNotification?.dataId}
                dataTestId={TOAST_ID}
                key={currentNotification?.id}
                visible={!!currentNotification}
                time={currentNotification?.duration ?? DEFAULT_NOTIFICATION_DURATION}
                type={currentNotification?.type ?? ToastVariant.INFORMATIVE}
                content={currentNotification?.message || ''}
                action={currentNotification?.action}
                onClose={() => (currentNotification ? removeNotification(currentNotification) : null)}
                direction={direction}
            />
        </NotificationWrapper>
    );
}

export default NotificationComponent;
