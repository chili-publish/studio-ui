import { Select, SelectOptions } from '@chili-publish/grafx-shared-components';
import { useCallback, useMemo } from 'react';
import { Layout, LayoutListItemType } from '@chili-publish/studio-sdk';
import { useLayoutTranslations } from 'src/core/hooks/useLayoutTranslations';
import { useUITranslations } from '../../../core/hooks/useUITranslations';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import StudioMobileDropdown from '../../shared/StudioMobileDropdown/StudioMobileDropdown';

interface AvailableLayoutsProp {
    selectedLayout: Layout | null;
    availableForUserLayouts: LayoutListItemType[];

    mobileDevice?: boolean;
    onMobileOptionListToggle?: (_: boolean) => void;
}

const AvailableLayouts = ({
    selectedLayout,
    availableForUserLayouts,
    mobileDevice,
    onMobileOptionListToggle,
}: AvailableLayoutsProp) => {
    const { getUITranslation } = useUITranslations();
    const { getTranslatedLayoutDisplayName } = useLayoutTranslations();

    const selectLabel = getUITranslation(['formBuilder', 'layouts', 'inputLabel'], 'Select layout');
    const placeholder = getUITranslation(['formBuilder', 'layouts', 'inputPlaceholder'], 'Select layout');

    const layoutOptions = useMemo(() => {
        const resultList = availableForUserLayouts.map((item) => ({
            label: getTranslatedLayoutDisplayName(item),
            value: item.id,
        }));
        resultList.sort((item1, item2) => item1.label.localeCompare(item2.label));

        return resultList;
    }, [availableForUserLayouts, getTranslatedLayoutDisplayName]);

    const selectedLayoutOption = useMemo(() => {
        return layoutOptions.find((item) => item.value === selectedLayout?.id) || null;
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
            label={selectLabel}
            placeholder={placeholder}
        />
    ) : (
        <Select
            id="sui-dropdown-available-layout"
            dataId={getDataIdForSUI(`dropdown-available-layout`)}
            dataTestId={getDataTestIdForSUI(`dropdown-available-layout`)}
            value={selectedLayoutOption as SelectOptions}
            options={layoutOptions}
            isSearchable={false}
            onChange={(option) => handleLayoutChange(option?.value as string)}
            label={selectLabel}
            placeholder={placeholder}
        />
    );
};

export default AvailableLayouts;
