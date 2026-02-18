import { ButtonVariant, Dialog } from '@chili-publish/grafx-shared-components';
import { APP_WRAPPER_ID } from '../../utils/constants';
import { useUITranslations } from '../../core/hooks/useUITranslations';

interface ConnectorAuthenticationModalProp {
    name: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export const ConnectorAuthenticationModal = ({ name, onConfirm, onCancel }: ConnectorAuthenticationModalProp) => {
    const { getUITranslation } = useUITranslations();

    return (
        <Dialog
            title={getUITranslation(['modals', 'connectorAuthorization', 'title'], 'Authorize connector')}
            description={getUITranslation(
                ['modals', 'connectorAuthorization', 'description'],
                `${name} needs to be authorized. Click 'Authorize' to redirect and grant permissions.`,
                { name },
            )}
            isVisible
            anchorId={APP_WRAPPER_ID}
            approveButton={{
                label: getUITranslation(['modals', 'connectorAuthorization', 'approveBtnLabel'], 'Authorize'),
                onClick: onConfirm,
                variant: ButtonVariant.primary,
            }}
            cancelButton={{
                onClick: onCancel,
                label: getUITranslation(['modals', 'connectorAuthorization', 'cancelBtnLabel'], 'Cancel'),
                variant: ButtonVariant.tertiary,
            }}
        />
    );
};

export default ConnectorAuthenticationModal;
