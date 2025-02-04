import { Select } from '@chili-publish/grafx-shared-components';
import { useCallback, useMemo } from 'react';
import { Layout, LayoutListItemType } from '@chili-publish/studio-sdk';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import StudioMobileDropdown from '../../shared/StudioMobileDropdown/StudioMobileDropdown';

interface AvailableLayoutsProp {
    selectedLayout: Layout | null;
    layouts: LayoutListItemType[];

    mobileDevice?: boolean;
    onMobileOptionListToggle?: (_: boolean) => void;
}

function AvailableLayouts({ selectedLayout, layouts, mobileDevice, onMobileOptionListToggle }: AvailableLayoutsProp) {
    const availableLayouts = useMemo(() => layouts.filter((item) => item.availableForUser), [layouts]);

    const layoutOptions = useMemo(() => {
        let resultList = [];
        if (!availableLayouts.length && selectedLayout)
            return [{ label: selectedLayout.displayName ?? selectedLayout.name, value: selectedLayout.id }];

        resultList = availableLayouts.map((item) => ({ label: item.displayName ?? item.name, value: item.id }));
        resultList.sort((item1, item2) => item1.label.localeCompare(item2.label));

        return resultList;
    }, [selectedLayout, availableLayouts]);

    const selectedLayoutOption = useMemo(
        () =>
            selectedLayout
                ? { label: selectedLayout.displayName ?? selectedLayout.name, value: selectedLayout.id }
                : layoutOptions?.[0],
        [selectedLayout, layoutOptions],
    );

    const handleLayoutChange = useCallback(async (layoutId: string) => {
        await window.StudioUISDK.layout.select(layoutId);
    }, []);

    if (availableLayouts.length < 2) return null;

    return mobileDevice ? (
        <StudioMobileDropdown
            dataId={getDataIdForSUI(`dropdown-available-layout`)}
            selectedValue={selectedLayoutOption}
            options={layoutOptions}
            onChange={(option) => handleLayoutChange(option as string)}
            onMenuOpen={() => onMobileOptionListToggle?.(true)}
            onMenuClose={() => onMobileOptionListToggle?.(false)}
        />
    ) : (
        <Select
            dataId={getDataIdForSUI(`dropdown-available-layout`)}
            dataTestId={getDataTestIdForSUI(`dropdown-available-layout`)}
            value={selectedLayoutOption}
            options={layoutOptions}
            isSearchable={false}
            onChange={(option) => handleLayoutChange(option?.value as string)}
        />
    );
}

export default AvailableLayouts;
