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
            <div data-testid="tooltip" data-content={content} data-position={position} data-anchor-id={anchorId}>
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
            minAspect: { horizontal: 1, vertical: 2 },
            maxAspect: { horizontal: 3, vertical: 4 },
        });

        renderWithProviders(<RangeConstraintIcon layout={layout} />);

        const tooltip = screen.getByTestId('tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveAttribute(
            'data-content',
            'Proportions are limited — only aspect ratios between 1:2 and 3:4 are allowed.',
        );
        expect(tooltip).toHaveAttribute('data-position', 'top');
    });

    it('should render icon with tooltip when only min aspect constraint is defined', () => {
        const layout = createMockLayout({
            enabled: true,
            constraintMode: ConstraintMode.range,
            minAspect: { horizontal: 1, vertical: 4 },
        });

        renderWithProviders(<RangeConstraintIcon layout={layout} />);

        const tooltip = screen.getByTestId('tooltip');

        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveAttribute(
            'data-content',
            'Proportions are limited — only aspect ratios greater than 1:4 are allowed.',
        );
    });

    it('should render icon with tooltip when only max aspect constraint is defined', () => {
        const layout = createMockLayout({
            enabled: true,
            constraintMode: ConstraintMode.range,
            maxAspect: { horizontal: 3, vertical: 4 },
        });

        renderWithProviders(<RangeConstraintIcon layout={layout} />);

        const tooltip = screen.getByTestId('tooltip');

        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveAttribute(
            'data-content',
            'Proportions are limited — only aspect ratios lower than 3:4 are allowed.',
        );
    });
});
