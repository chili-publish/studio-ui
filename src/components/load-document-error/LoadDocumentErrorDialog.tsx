import { Button, ButtonVariant, ModalLayout, ModalSize } from '@chili-publish/grafx-shared-components';
import { useMemo } from 'react';
import { APP_WRAPPER_ID } from '../../utils/constants';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { useUITranslations } from '../../core/hooks/useUITranslations';
import { LoadDocumentError } from '../../types/types';
import { MessageWrapper, TitleWrapper } from './LoadDocumentErrorDialog.styles';

interface LoadDocumentErrorDialogProps {
    loadDocumentError: { isOpen: boolean; error: LoadDocumentError } | undefined;
    goBack: () => void;
}

const LoadDocumentErrorDialog = ({ loadDocumentError, goBack }: LoadDocumentErrorDialogProps) => {
    const { getUITranslation } = useUITranslations();

    const onClose = () => {
        goBack();
    };

    const modalTitle = useMemo(() => {
        if (!loadDocumentError?.error) return '';
        const { error } = loadDocumentError;
        if (error === LoadDocumentError.VERSION_ERROR) {
            return getUITranslation(
                ['modals', 'loadDocumentError', 'versionMismatch', 'title'],
                'Incompatible project',
            );
        }
        return getUITranslation(['modals', 'loadDocumentError', 'projectError', 'title'], 'Project error');
    }, [loadDocumentError, getUITranslation]);

    const modalContent = useMemo(() => {
        if (!loadDocumentError?.error) return '';
        const { error } = loadDocumentError;

        if (error === LoadDocumentError.VERSION_ERROR) {
            return getUITranslation(
                ['modals', 'loadDocumentError', 'versionMismatch', 'description'],
                'This project cannot be opened. Please contact your Admin.',
            );
        }
        if (error === LoadDocumentError.PARSING_ERROR) {
            return getUITranslation(
                ['modals', 'loadDocumentError', 'parsingError', 'description'],
                "It seems like this project is corrupt and can't be loaded. For further assistance, please contact your Admin.",
            );
        }
        if (error === LoadDocumentError.FORMAT_ERROR) {
            return getUITranslation(
                ['modals', 'loadDocumentError', 'formatError', 'description'],
                "It seems like this project is corrupt and can't be loaded. For further assistance, please contact your Admin.",
            );
        }
        return getUITranslation(
            ['modals', 'loadDocumentError', 'technicalError', 'description'],
            'A technical error has occurred. Please try again later. For further assistance, please contact your Admin.',
        );
    }, [loadDocumentError, getUITranslation]);

    return (
        <ModalLayout.Container
            id="document-load-error-dialog"
            dataId={getDataIdForSUI('document-load-error-dialog')}
            dataTestId={getDataTestIdForSUI('document-load-error-dialog')}
            anchorId={APP_WRAPPER_ID}
            size={ModalSize.S}
            isVisible={loadDocumentError?.isOpen || false}
            onClose={onClose}
            isCloseIconHidden
        >
            <ModalLayout.Title>
                <TitleWrapper>{modalTitle}</TitleWrapper>
            </ModalLayout.Title>
            <ModalLayout.Body>
                <MessageWrapper>{modalContent}</MessageWrapper>
            </ModalLayout.Body>
            <ModalLayout.Footer>
                <Button
                    id={getDataIdForSUI(`dismiss-btn`)}
                    dataTestId={getDataTestIdForSUI(`dismiss-btn`)}
                    variant={ButtonVariant.primary}
                    onClick={onClose}
                    label={getUITranslation(['modals', 'loadDocumentError', 'btnLabel'], 'Close')}
                />
            </ModalLayout.Footer>
        </ModalLayout.Container>
    );
};

export default LoadDocumentErrorDialog;
