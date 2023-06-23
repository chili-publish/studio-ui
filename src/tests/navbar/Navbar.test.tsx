import { fireEvent, render } from '@testing-library/react';
import Navbar from '../../components/navbar/Navbar';

describe('Navbar', () => {
    it('Should render 4 navbar items', () => {
        const { getByTestId } = render(
            <Navbar
                zoom={100}
                undoStackState={{
                    canRedo: false,
                    canUndo: false,
                }}
            />,
        );
        const navbarItems = Array.from(getByTestId('navbar').children[0].children);
        expect(navbarItems).toHaveLength(4);
    });

    it('Should show download panel when download button is clicked', async () => {
        const { getByRole, getByText } = render(
            <Navbar
                zoom={100}
                undoStackState={{
                    canRedo: false,
                    canUndo: false,
                }}
            />,
        );
        const downloadButton = getByRole('button', { name: /download/i });

        fireEvent.click(downloadButton);
        expect(getByText(/output type/i)).toBeInTheDocument();

        const dropdown = getByText(/jpg/i);
        expect(dropdown).toBeInTheDocument();

        fireEvent.click(dropdown);
    });
});
