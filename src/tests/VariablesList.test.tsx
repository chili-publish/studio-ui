import { render, screen } from '@testing-library/react';
import VariablesList from '../components/variables/VariablesList';
import { variables } from './mocks/mockVariables';

describe('Variables List', () => {
    it('Hidden variables should not be shown', async () => {
        render(<VariablesList variables={variables} />);

        const variable1 = await screen.findByText('Variable1');
        const variable12 = await screen.findByText('Variable12');
        const shortVariable1 = screen.getByText('Short Variable 1');
        const longVariable1 = screen.queryByText('Long Variable 1');

        expect(variable1).toBeInTheDocument();
        expect(variable12).toBeInTheDocument();
        expect(shortVariable1).toBeInTheDocument();
        expect(longVariable1).not.toBeInTheDocument();
    });
});
