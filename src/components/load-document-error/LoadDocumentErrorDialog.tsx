import { Button, ButtonVariant, ModalLayout, ModalSize } from '@chili-publish/grafx-shared-components';
import { useMemo } from 'react';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { MessageWrapper, TitleWrapper } from './LoadDocumentErrorDialog.styles';
import { APP_WRAPPER_ID } from '../../utils/constants';
import { LoadDocumentError } from '../../types/types';

interface LoadDocumentErrorDialog {
    loadDocumentError?: { isOpen: boolean; error: LoadDocumentError };
    goBack: () => void;
}
function LoadDocumentErrorDialog({ loadDocumentError, goBack }: LoadDocumentErrorDialog) {
    const onClose = () => {
        goBack();
    };

    const modalTitle = useMemo(() => {
        if (!loadDocumentError?.error) return '';
        const { error } = loadDocumentError;
        return error === LoadDocumentError.VERSION_ERROR ? 'Incompatible project' : 'Project error';
    }, [loadDocumentError]);

    const modalContent = useMemo(() => {
        if (!loadDocumentError?.error) return '';
        const { error } = loadDocumentError;

        if (error === LoadDocumentError.VERSION_ERROR)
            return 'This project cannot be opened. Please contact your Admin.';
        if (error === LoadDocumentError.PARSING_ERROR || error === LoadDocumentError.FORMAT_ERROR)
            return "It seems like this project is corrupt and can't be loaded. For further assistance, please contact your Admin.";
        return 'A technical error has occurred. Please try again later. For further assistance, please contact your Admin.';
    }, [loadDocumentError]);

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
                    label="Close"
                />
            </ModalLayout.Footer>
        </ModalLayout.Container>
    );
}

export default LoadDocumentErrorDialog;
