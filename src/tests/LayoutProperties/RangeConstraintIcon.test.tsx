import {
    ConstraintMode,
    LayoutIntent,
    LayoutPropertiesType,
    MeasurementUnit,
    ResizableLayoutProperties,
} from '@chili-publish/studio-sdk';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@tests/mocks/Provider';
import RangeConstraintIcon from '../../components/layoutProperties/RangeConstraintIcon';

// Mock the grafx-shared-components
jest.mock('@chili-publish/grafx-shared-components', () => {
    const originalModule = jest.requireActual('@chili-publish/grafx-shared-components');

    return {
        __esModule: true,
        ...originalModule,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Tooltip: ({ content, children, position, anchorId }: any) => (
            <div data-testid="tooltip" data-position={position} data-anchor-id={anchorId}>
                <div data-testid="tooltip-content">{content}</div>
                {children}
            </div>
        ),
        TooltipPosition: {
            TOP: 'top',
        },
    };
});

describe('RangeConstraintIcon', () => {
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

    it('should render icon with tooltip when both min and max aspect constraints are defined', () => {
        const layout = createMockLayout({
            enabled: true,
            constraintMode: ConstraintMode.range,
            aspectRange: {
                min: { horizontal: 1, vertical: 2 },
                max: { horizontal: 3, vertical: 4 },
            },
        });

        renderWithProviders(<RangeConstraintIcon layout={layout} />);

        const tooltip = screen.getByTestId('tooltip');
        const tooltipContent = screen.getByTestId('tooltip-content');
        expect(tooltip).toBeInTheDocument();
        expect(tooltipContent).toHaveTextContent(
            'Proportions are limited — only aspect ratios between 1:2 and 3:4 are allowed.',
        );
        expect(tooltip).toHaveAttribute('data-position', 'top');
    });
});
