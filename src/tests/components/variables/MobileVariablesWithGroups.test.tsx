import { Variable, VariableType, VariableVisibilityType } from '@chili-publish/studio-sdk';
import { variablesWithGroups } from '@tests/mocks/mockVariables';
import { useUserInterfaceDetailsContext } from 'src/components/navbar/UserInterfaceDetailsContext';
import { renderWithProviders } from '@tests/mocks/Provider';
import MobileVariablesList from 'src/components/variables/mobileVariables/MobileVariablesList';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setVariables } from '../../../store/reducers/variableReducer';
import { setupStore } from '../../../store';

jest.mock('../../../components/navbar/UserInterfaceDetailsContext', () => ({
    useUserInterfaceDetailsContext: jest.fn(),
}));

describe('Mobile variables With Groups', () => {
    let reduxStore: ReturnType<typeof setupStore>;

    beforeEach(() => {
        reduxStore = setupStore();
        reduxStore.dispatch(setVariables(variablesWithGroups as Variable[]));
    });
    it('should render grouped variables when flag is enabled on user interface level', async () => {
        (useUserInterfaceDetailsContext as jest.Mock).mockReturnValue({
            formBuilder: {
                variables: {
                    variableGroups: { show: true },
                },
            },
        });
        renderWithProviders(<MobileVariablesList />, { reduxStore });

        const groupedVariables = screen.getAllByTestId(/variable-wrapper/);
        expect(groupedVariables).toHaveLength(8);

        const group = groupedVariables[0];
        expect(group).toHaveTextContent('New group');

        await userEvent.click(within(group).getByRole('button'));

        await waitFor(() => {
            expect(screen.getByText('Variable')).toBeInTheDocument();
            // hidden variables are not rendered
            expect(screen.queryByText('Variable 1')).not.toBeInTheDocument();
        });

        expect(groupedVariables[1]).toHaveTextContent('Name');
        expect(within(groupedVariables[1]).getByRole('textbox')).toHaveValue('John Doe');

        expect(groupedVariables[2]).toHaveTextContent('Type');
        expect(within(groupedVariables[2]).getByRole('textbox')).toHaveValue('Company');

        expect(groupedVariables[3]).toHaveTextContent('Template');
        expect(within(groupedVariables[3]).getByText('3')).toBeInTheDocument();

        expect(groupedVariables[4]).toHaveTextContent('Height');
        expect(within(groupedVariables[4]).getByRole('textbox')).toHaveValue('500');
        expect(within(groupedVariables[4]).getByRole('textbox')).toHaveAttribute('step', '1');

        expect(groupedVariables[5]).toHaveTextContent('New group 1');

        expect(groupedVariables[6]).toHaveTextContent('Ratioxx');
        expect(within(groupedVariables[6]).getByRole('textbox')).toHaveValue('6.00');
        expect(within(groupedVariables[6]).getByRole('textbox')).toHaveAttribute('step', '1');

        expect(groupedVariables[7]).toHaveTextContent('Ratio');
        expect(within(groupedVariables[7]).getByRole('textbox')).toHaveValue('8');
        expect(within(groupedVariables[7]).getByRole('textbox')).not.toHaveAttribute('step');
    });

    it('a group with hidden variables should not be rendered', async () => {
        (useUserInterfaceDetailsContext as jest.Mock).mockReturnValue({
            formBuilder: {
                variables: {
                    variableGroups: { show: true },
                },
            },
        });
        const mockVariables = [
            {
                id: '4bd6606d-3b72-424f-92aa-2a8c7ccecd4b',
                type: VariableType.group,
                parentId: '',
                name: 'New group',
                isReadonly: false,
                isRequired: false,
                isVisible: true,
                visibility: {
                    type: VariableVisibilityType.visible,
                },
                privateData: {},
            },
            {
                id: 'c97376c4-156a-47d4-a7af-18d4f3ab2d26',
                type: VariableType.shortText,
                parentId: '4bd6606d-3b72-424f-92aa-2a8c7ccecd4b',
                name: 'Variable',
                isReadonly: false,
                isRequired: false,
                isVisible: false,
                visibility: {
                    type: VariableVisibilityType.visible,
                },
                value: '',
                occurrences: 0,
                privateData: {},
                removeParagraphIfEmpty: false,
                isDontBreak: false,
            },
        ];

        reduxStore.dispatch(setVariables(mockVariables as Variable[]));

        renderWithProviders(<MobileVariablesList />, { reduxStore });

        const groupedVariables = screen.getAllByTestId(/variable-wrapper/);
        expect(groupedVariables).toHaveLength(1);

        expect(within(groupedVariables[0]).queryByText('New group')).not.toBeInTheDocument();
    });

    it('a hidden group should not be rendered', async () => {
        (useUserInterfaceDetailsContext as jest.Mock).mockReturnValue({
            formBuilder: {
                variables: {
                    variableGroups: { show: true },
                },
            },
        });
        const mockVariables = [
            {
                id: '4bd6606d-3b72-424f-92aa-2a8c7ccecd4b',
                type: VariableType.group,
                parentId: '',
                name: 'New group',
                isReadonly: false,
                isRequired: false,
                isVisible: false,
                visibility: {
                    type: VariableVisibilityType.visible,
                },
                privateData: {},
            },
            {
                id: 'c97376c4-156a-47d4-a7af-18d4f3ab2d26',
                type: VariableType.shortText,
                parentId: '4bd6606d-3b72-424f-92aa-2a8c7ccecd4b',
                name: 'Variable',
                isReadonly: false,
                isRequired: false,
                isVisible: true,
                visibility: {
                    type: VariableVisibilityType.visible,
                },
                value: '',
                occurrences: 0,
                privateData: {},
                removeParagraphIfEmpty: false,
                isDontBreak: false,
            },
        ];

        reduxStore.dispatch(setVariables(mockVariables as Variable[]));

        renderWithProviders(<MobileVariablesList />, { reduxStore });

        expect(screen.queryByText('New group')).not.toBeInTheDocument();
        expect(screen.queryByText('Variable')).not.toBeInTheDocument();
    });

    it('groups are not rendered when showing flag is disabled on user interface level', () => {
        (useUserInterfaceDetailsContext as jest.Mock).mockReturnValue({
            formBuilder: {
                variables: {
                    variableGroups: { show: false },
                },
            },
        });
        renderWithProviders(<MobileVariablesList />, { reduxStore });

        const groupedVariables = screen.queryAllByTestId(/variable-wrapper/);
        expect(groupedVariables).toHaveLength(0);

        expect(screen.queryByText('New group')).not.toBeInTheDocument();
        expect(screen.queryByText('New group 1')).not.toBeInTheDocument();
    });
});
