import {
    ConstraintMode,
    LayoutIntent,
    LayoutPropertiesType,
    MeasurementUnit,
    ResizableLayoutProperties,
} from '@chili-publish/studio-sdk';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@tests/mocks/Provider';
import RangeConstraintErrorMessage from '../../components/layoutProperties/RangeConstraintErrorMessage';

jest.mock('@chili-publish/grafx-shared-components', () => {
    const originalModule = jest.requireActual('@chili-publish/grafx-shared-components');

    return {
        __esModule: true,
        ...originalModule,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Tooltip: ({ content, children, position, anchorId }: any) => (
            <div data-testid="tooltip" data-content={content} data-position={position} data-anchor-id={anchorId}>
                {children}
            </div>
        ),
        TooltipPosition: {
            TOP: 'top',
        },
    };
});

describe('RangeConstraintErrorMessage', () => {
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

    it('should correctly render tooltip when both min and max aspect constraints are defined and layout properties are using the unit of the layout', () => {
        const layout = createMockLayout({
            enabled: true,
            constraintMode: ConstraintMode.range,
            aspectRange: {
                min: { horizontal: 1, vertical: 2 },
                max: { horizontal: 3, vertical: 4 },
            },
        });

        renderWithProviders(
            <RangeConstraintErrorMessage
                layout={layout}
                currentWidth="400 mm"
                currentHeight="200 mm"
                unit={MeasurementUnit.mm}
            />,
        );

        const tooltip = screen.getByTestId('constraint-proportion-error-message');
        expect(tooltip).toBeInTheDocument();

        expect(tooltip).toHaveTextContent('To respect the allowed proportions (1:2 to 3:4):');
        expect(tooltip).toHaveTextContent('If the width is 400 mm, the height must be between 533.33 mm and 800 mm');
        expect(tooltip).toHaveTextContent('If the height is 200 mm, the width must be between 100 mm and 150 mm');
    });
});
