import { stacksAfterBreadcrumbClick } from '../../utils/mediaUtils';

describe('stacksAfterBreadcrumbClick', () => {
    const navigationStack = ['0000', '0', 'SubjectTypeDemo', 'Child'];
    const breadcrumbStack = ['SubjectTypeDemo', 'Child'];

    it('returns to the connector root from Home', () => {
        expect(stacksAfterBreadcrumbClick(navigationStack, breadcrumbStack, 0)).toEqual({
            navigationStack: [],
            breadcrumbStack: [],
        });
    });

    it('keeps the mapped folder when a breadcrumb folder is selected', () => {
        expect(stacksAfterBreadcrumbClick(navigationStack, breadcrumbStack, 1)).toEqual({
            navigationStack: ['0000', '0', 'SubjectTypeDemo'],
            breadcrumbStack: ['SubjectTypeDemo'],
        });
    });

    it('navigates by breadcrumb index when there is no mapped prefix', () => {
        expect(stacksAfterBreadcrumbClick(['Assets', 'Logos'], ['Assets', 'Logos'], 1)).toEqual({
            navigationStack: ['Assets'],
            breadcrumbStack: ['Assets'],
        });
    });
});
