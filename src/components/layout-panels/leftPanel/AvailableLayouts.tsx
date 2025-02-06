import { Select, SelectOptions } from '@chili-publish/grafx-shared-components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layout, LayoutListItemType } from '@chili-publish/studio-sdk';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import StudioMobileDropdown from '../../shared/StudioMobileDropdown/StudioMobileDropdown';

interface AvailableLayoutsProp {
    selectedLayout: Layout | null;
    availableForUserLayouts: LayoutListItemType[];

    mobileDevice?: boolean;
    onMobileOptionListToggle?: (_: boolean) => void;
}

function AvailableLayouts({
    selectedLayout,
    availableForUserLayouts,
    mobileDevice,
    onMobileOptionListToggle,
}: AvailableLayoutsProp) {
    const [selectedLayoutOption, setSelectedLayoutOption] = useState<SelectOptions>();

    const layoutOptions = useMemo(() => {
        const resultList = availableForUserLayouts.map((item) => ({
            label: item.displayName ?? item.name,
            value: item.id,
        }));
        resultList.sort((item1, item2) => item1.label.localeCompare(item2.label));

        return resultList;
    }, [availableForUserLayouts]);

    useEffect(() => {
        const selectLayout = async () => {
            const isSelectedLayoutAvailable = layoutOptions.some((item) => item.value === selectedLayout?.id);

            if ((!isSelectedLayoutAvailable || !selectedLayout) && !selectedLayoutOption) {
                setSelectedLayoutOption(layoutOptions[0]);
                await window.StudioUISDK.layout.select(layoutOptions[0].value);
            }
            if (isSelectedLayoutAvailable && selectedLayout) {
                setSelectedLayoutOption({
                    label: selectedLayout.displayName ?? selectedLayout.name,
                    value: selectedLayout.id,
                });
            }
        };
        selectLayout();
    }, [selectedLayout, layoutOptions]);

    const handleLayoutChange = useCallback(async (layoutId: string) => {
        await window.StudioUISDK.layout.select(layoutId);
    }, []);

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
