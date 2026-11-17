import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateProjectNameModal from '../../../components/create-project/CreateProjectNameModal';
import { APP_WRAPPER_ID } from '../../../utils/constants';
import { getDataTestIdForSUI } from '../../../utils/dataIds';
import { renderWithProviders } from '../../mocks/Provider';

describe('CreateProjectNameModal', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    beforeEach(() => {
        onConfirm.mockReset();
        onCancel.mockReset();
    });

    const renderModal = (initialName = 'Poster') =>
        renderWithProviders(
            <div id={APP_WRAPPER_ID}>
                <CreateProjectNameModal initialName={initialName} onConfirm={onConfirm} onCancel={onCancel} />
            </div>,
        );

    it('asks for a name and creates the project with the trimmed name', async () => {
        onConfirm.mockResolvedValue(undefined);
        const user = userEvent.setup();
        renderModal('  Summer poster  ');

        await user.click(screen.getByTestId(getDataTestIdForSUI('create-project-approve-btn')));

        expect(onConfirm).toHaveBeenCalledWith('Summer poster');
        expect(onCancel).not.toHaveBeenCalled();
    });

    it('does not create a project when the name is empty', async () => {
        const user = userEvent.setup();
        renderModal('   ');

        await user.click(screen.getByTestId(getDataTestIdForSUI('create-project-approve-btn')));

        expect(onConfirm).not.toHaveBeenCalled();
        expect(screen.getByText('Enter a project name')).toBeInTheDocument();
    });

    it('leaves without creating when cancelled', async () => {
        const user = userEvent.setup();
        renderModal();

        await user.click(screen.getByTestId(getDataTestIdForSUI('create-project-cancel-btn')));

        expect(onCancel).toHaveBeenCalled();
        expect(onConfirm).not.toHaveBeenCalled();
    });
});
