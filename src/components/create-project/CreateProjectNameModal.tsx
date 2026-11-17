import {
    Button,
    ButtonVariant,
    Input,
    ModalLayout,
    ModalSize,
    ValidationTypes,
} from '@chili-publish/grafx-shared-components';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useUITranslations } from '../../core/hooks/useUITranslations';
import { APP_WRAPPER_ID } from '../../utils/constants';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';

const INVALID_PROJECT_NAME = /[\\/:*?"<>|]/;

const FooterActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    width: 100%;
`;

interface CreateProjectNameModalProps {
    initialName: string;
    onConfirm: (name: string) => Promise<void>;
    onCancel: () => void;
}

const CreateProjectNameModal = ({ initialName, onConfirm, onCancel }: CreateProjectNameModalProps) => {
    const { getUITranslation } = useUITranslations();
    const [name, setName] = useState(initialName);
    const [error, setError] = useState<string | undefined>();
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        document.getElementById('create-project-name-input')?.focus();
    }, []);

    const handleConfirm = useCallback(async () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError(getUITranslation(['modals', 'createProject', 'emptyNameError'], 'Enter a project name'));
            return;
        }
        if (INVALID_PROJECT_NAME.test(trimmedName)) {
            setError(
                getUITranslation(
                    ['modals', 'createProject', 'invalidNameError'],
                    'Name cannot contain \\ / : * ? " < > |',
                ),
            );
            return;
        }

        setError(undefined);
        setIsPending(true);
        try {
            await onConfirm(trimmedName);
        } catch (confirmError) {
            const fallback = getUITranslation(
                ['modals', 'createProject', 'createError'],
                'Could not create the project',
            );
            setError(confirmError instanceof Error && confirmError.message ? confirmError.message : fallback);
            setIsPending(false);
        }
    }, [getUITranslation, name, onConfirm]);

    const handleCancel = useCallback(() => {
        if (isPending) return;
        onCancel();
    }, [isPending, onCancel]);

    return (
        <ModalLayout.Container
            id="create-project-name-dialog"
            dataId={getDataIdForSUI('create-project-name-dialog')}
            dataTestId={getDataTestIdForSUI('create-project-name-dialog')}
            anchorId={APP_WRAPPER_ID}
            size={ModalSize.S}
            isVisible
            isDraggable
            positionOnOpen={{ top: 72, right: 24 }}
            onClose={handleCancel}
        >
            <ModalLayout.Title>
                {getUITranslation(['modals', 'createProject', 'title'], 'Create project')}
            </ModalLayout.Title>
            <ModalLayout.Body>
                <Input
                    type="text"
                    name="project-name"
                    id="create-project-name-input"
                    label={getUITranslation(['modals', 'createProject', 'nameLabel'], 'Project name')}
                    placeholder={getUITranslation(['modals', 'createProject', 'namePlaceholder'], 'Project name')}
                    value={name}
                    onChange={(event) => {
                        setName(event.target.value);
                        setError(undefined);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            handleConfirm();
                        }
                    }}
                    validation={error ? ValidationTypes.ERROR : undefined}
                    validationErrorMessage={error}
                    dataId={getDataIdForSUI('create-project-name-input')}
                    dataTestId={getDataTestIdForSUI('create-project-name-input')}
                    disabled={isPending}
                />
                <p>
                    {getUITranslation(
                        ['modals', 'createProject', 'description'],
                        'Review the template, then enter a name to create the project. Closing without creating leaves nothing saved.',
                    )}
                </p>
            </ModalLayout.Body>
            <ModalLayout.Footer>
                <FooterActions>
                    <Button
                        variant={ButtonVariant.tertiary}
                        onClick={handleCancel}
                        disabled={isPending}
                        label={getUITranslation(['modals', 'createProject', 'cancelBtnLabel'], 'Cancel')}
                        dataId={getDataIdForSUI('create-project-cancel-btn')}
                        dataTestId={getDataTestIdForSUI('create-project-cancel-btn')}
                    />
                    <Button
                        variant={ButtonVariant.primary}
                        onClick={handleConfirm}
                        disabled={isPending}
                        loading={isPending}
                        label={getUITranslation(['modals', 'createProject', 'approveBtnLabel'], 'Create')}
                        dataId={getDataIdForSUI('create-project-approve-btn')}
                        dataTestId={getDataTestIdForSUI('create-project-approve-btn')}
                    />
                </FooterActions>
            </ModalLayout.Footer>
        </ModalLayout.Container>
    );
};

export default CreateProjectNameModal;
