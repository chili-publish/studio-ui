import { ButtonVariant, Dialog } from '@chili-publish/grafx-shared-components';
import { APP_WRAPPER_ID } from '../../utils/constants';

interface ConnectorAuthenticationModalProp {
    name: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export function ConnectorAuthenticationModal({ name, onConfirm, onCancel }: ConnectorAuthenticationModalProp) {
    return (
        <Dialog
            title="Authorize connector"
            description={`${name} needs to be authorized. Click 'Authorize' to redirect and grant permissions.`}
            isVisible
            anchorId={APP_WRAPPER_ID}
            approveButton={{
                label: 'Authorize',
                onClick: onConfirm,
                variant: ButtonVariant.primary,
            }}
            cancelButton={{
                onClick: onCancel,
                label: 'Cancel',
                variant: ButtonVariant.tertiary,
            }}
        />
    );
}

export default ConnectorAuthenticationModal;
