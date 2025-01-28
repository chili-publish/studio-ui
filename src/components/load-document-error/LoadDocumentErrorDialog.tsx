import { Button, ButtonVariant, ModalLayout, ModalSize } from '@chili-publish/grafx-shared-components';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { MessageWrapper } from './LoadDocumentErrorDialog.styles';
import { APP_WRAPPER_ID } from '../../utils/constants';

interface LoadDocumentErrorDialog {
    isLoadDocumentErrorDialogOpen: boolean;
    goBack: () => void;
}
function LoadDocumentErrorDialog({ isLoadDocumentErrorDialogOpen, goBack }: LoadDocumentErrorDialog) {
    const onClose = () => {
        goBack();
    };

    return (
        <ModalLayout.Container
            id="document-load-error-dialog"
            dataId={getDataIdForSUI('document-load-error-dialog')}
            dataTestId={getDataTestIdForSUI('document-load-error-dialog')}
            anchorId={APP_WRAPPER_ID}
            size={ModalSize.S}
            isVisible={isLoadDocumentErrorDialogOpen}
            onClose={onClose}
            isCloseIconHidden
        >
            <ModalLayout.Title>Incompatible project</ModalLayout.Title>
            <ModalLayout.Body>
                <MessageWrapper>This project cannot be opened. Please contact your Admin.</MessageWrapper>
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
