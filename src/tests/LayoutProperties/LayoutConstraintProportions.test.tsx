import EditorSDK, {
    ConstraintMode,
    LayoutIntent,
    LayoutPropertiesType,
    MeasurementUnit,
    ResizableLayoutProperties,
} from '@chili-publish/studio-sdk';
import { APP_WRAPPER } from '@tests/mocks/app';
import { renderWithProviders } from '@tests/mocks/Provider';
import LayoutProperties from 'src/components/layoutProperties/LayoutProperties';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import userEvent from '@testing-library/user-event';

const mockSDK = mock<EditorSDK>();

describe('Layout constraint proportions', () => {
    mockSDK.page.setSize = jest.fn().mockRejectedValue(new Error('Error'));
    mockSDK.utils.unitEvaluate = jest.fn().mockResolvedValue({ parsedData: 100 });
    window.StudioUISDK = mockSDK;

    const createMockLayout = (resizableByUser: ResizableLayoutProperties): LayoutPropertiesType =>
        ({
            id: 'test-layout',
            name: 'Test Layout',
            displayName: 'Test Layout',
            width: { value: 500, isOverride: false, isReadOnly: false },
            height: { value: 800, isOverride: false, isReadOnly: false },
            intent: { value: LayoutIntent.print, isOverride: false, isReadOnly: false },
            unit: { value: MeasurementUnit.px, isOverride: false, isReadOnly: false },
            availableForUser: true,
            selectedByUser: true,
            resizableByUser,
        }) as LayoutPropertiesType;

    it('should display error message when layout propertioes do not match aspect ratio', async () => {
        const user = userEvent.setup();
        const layout = createMockLayout({
            enabled: true,
            constraintMode: ConstraintMode.range,
            minAspect: { horizontal: 1, vertical: 2 },
            maxAspect: { horizontal: 3, vertical: 4 },
        });

        const pageSize = {
            id: 'page-size-id',
            width: 100,
            height: 500,
        };

        renderWithProviders(<LayoutProperties layout={layout} pageSize={pageSize} />, {
            container: document.body.appendChild(APP_WRAPPER),
        });

        const widthInput = screen.getByLabelText('Width');
        const heightInput = screen.getByLabelText('Height');

        expect(widthInput).toBeInTheDocument();
        expect(heightInput).toBeInTheDocument();

        await user.type(widthInput, '100');
        await user.type(heightInput, '500');

        const applyButton = screen.getByRole('button', { name: 'Apply' });
        const cancelButton = screen.getByRole('button', { name: 'Cancel' });

        expect(applyButton).toBeInTheDocument();
        expect(cancelButton).toBeInTheDocument();

        await user.click(applyButton);

        await waitFor(() => {
            expect(screen.getByText('Only specific aspect ratios are supported.')).toBeInTheDocument();
        });
    });

    it('should convert width and height to the unit of the layout', async () => {
        mockSDK.utils.unitEvaluate = jest.fn().mockResolvedValue({ parsedData: 1889.763 });

        const user = userEvent.setup();

        const layout = createMockLayout({
            enabled: true,
            constraintMode: ConstraintMode.range,
            minAspect: { horizontal: 1, vertical: 2 },
            maxAspect: { horizontal: 3, vertical: 4 },
        });

        const pageSize = {
            id: 'page-size-id',
            width: 300,
            height: 600,
        };

        renderWithProviders(<LayoutProperties layout={layout} pageSize={pageSize} />, {
            container: document.body.appendChild(APP_WRAPPER),
        });

        const widthInput = screen.getByLabelText('Width');
        const heightInput = screen.getByLabelText('Height');

        expect(widthInput).toBeInTheDocument();
        expect(heightInput).toBeInTheDocument();

        await user.clear(heightInput);

        await user.type(heightInput, '500 mm');
        fireEvent.blur(heightInput);

        await waitFor(() => {
            expect(widthInput).toHaveValue('300 px');
            expect(heightInput).toHaveValue('1889.76 px');
        });

        const applyButton = screen.getByRole('button', { name: 'Apply' });
        await user.click(applyButton);

        await waitFor(() => {
            expect(widthInput).toHaveValue('300 px');
            expect(heightInput).toHaveValue('1889.76 px');
        });
    });

    it('should fallback to 0 when width is undefined', async () => {
        mockSDK.utils.unitEvaluate = jest.fn().mockResolvedValue({ parsedData: 0 });

        const user = userEvent.setup();
        const layout = createMockLayout({
            enabled: true,
            constraintMode: ConstraintMode.range,
            minAspect: { horizontal: 1, vertical: 2 },
            maxAspect: { horizontal: 3, vertical: 4 },
        });

        const pageSize = {
            id: 'page-size-id',
            width: 100,
            height: 300,
        };

        renderWithProviders(<LayoutProperties layout={layout} pageSize={pageSize} />, {
            container: document.body.appendChild(APP_WRAPPER),
        });

        const widthInput = screen.getByLabelText('Width');
        const heightInput = screen.getByLabelText('Height');

        expect(widthInput).toBeInTheDocument();
        expect(heightInput).toBeInTheDocument();

        await user.clear(widthInput);
        fireEvent.blur(widthInput);

        await waitFor(() => {
            expect(widthInput).toHaveValue('0 px');
            expect(heightInput).toHaveValue('300 px');
        });
    });

    it('should be able to revert changes', async () => {
        const user = userEvent.setup();
        const layout = createMockLayout({
            enabled: true,
            constraintMode: ConstraintMode.range,
            minAspect: { horizontal: 1, vertical: 2 },
            maxAspect: { horizontal: 3, vertical: 4 },
        });

        const pageSize = {
            id: 'page-size-id',
            width: 300,
            height: 600,
        };

        renderWithProviders(<LayoutProperties layout={layout} pageSize={pageSize} />, {
            container: document.body.appendChild(APP_WRAPPER),
        });

        const widthInput = screen.getByLabelText('Width');
        const heightInput = screen.getByLabelText('Height');

        expect(widthInput).toBeInTheDocument();
        expect(heightInput).toBeInTheDocument();

        await user.clear(heightInput);

        await user.type(heightInput, '500');
        expect(heightInput).toHaveValue('500');

        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        await user.click(cancelButton);

        expect(widthInput).toHaveValue('300 px');
        expect(heightInput).toHaveValue('600 px');
    });
});
