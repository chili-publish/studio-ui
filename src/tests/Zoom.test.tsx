import { render, fireEvent } from '@testing-library/react';
import Zoom from '../components/zoom/Zoom';

describe('Zoom', () => {
    it('should increment the zoom level on `faPlus` click', () => {
        const { getByTestId, rerender, getByLabelText } = render(<Zoom />);
        const zoomComponent = getByTestId('zoom');
        const zoomIn = zoomComponent.children[2];
        const zoomLevel = getByLabelText('zoom level');

        expect(zoomIn).toBeInTheDocument();

        fireEvent.click(zoomIn);

        rerender(<Zoom />);

        expect(zoomLevel).toHaveTextContent('110%');
    });
    it('should decrement the zoom level on `faMinus` click', () => {
        const { getByTestId, rerender, getByLabelText } = render(<Zoom />);
        const zoomComponent = getByTestId('zoom');
        const zoomIn = zoomComponent.children[0];
        const zoomLevel = getByLabelText('zoom level');

        expect(zoomIn).toBeInTheDocument();

        fireEvent.click(zoomIn);

        rerender(<Zoom />);

        expect(zoomLevel).toHaveTextContent('90%');
    });
});
