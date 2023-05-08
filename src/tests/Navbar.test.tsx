import { render } from '@testing-library/react';
import Navbar from '../components/navbar/Navbar';

describe('Navbar', () => {
    it('Should render 4 navbar items', () => {
        const { getByTestId } = render(<Navbar />);
        const navbarItems = Array.from(getByTestId('navbar').children[0].children);
        expect(navbarItems).toHaveLength(4);
    });
});
