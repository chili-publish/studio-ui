import { LayoutPropertiesType, PageSize } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatNumber, handleSetProperty } from '../../utils/formatNumber';
import { useUITranslations } from '../../core/hooks/useUITranslations';
import { withMeasurementUnit } from './util';

export const useLayoutProperties = (layout: LayoutPropertiesType, activePageDetails?: PageSize) => {
    const { getUITranslation } = useUITranslations();

    const [pageWidth, setPageWidth] = useState<string>('');
    const [pageHeight, setPageHeight] = useState<string>('');

    const minWidthLabel = getUITranslation(['formBuilder', 'layouts', 'minWidth'], 'Min');
    const minHeightLabel = getUITranslation(['formBuilder', 'layouts', 'minHeight'], 'Min');
    const maxWidthLabel = getUITranslation(['formBuilder', 'layouts', 'maxWidth'], 'Max');
    const maxHeightLabel = getUITranslation(['formBuilder', 'layouts', 'maxHeight'], 'Max');

    const measurementUnit = useMemo(() => {
        return layout?.unit.value;
    }, [layout]);

    const widthInputHelpText = useMemo(() => {
        if (layout?.resizableByUser.minWidth && layout?.resizableByUser.maxWidth) {
            return `${minWidthLabel}: ${formatNumber(
                layout.resizableByUser.minWidth,
                measurementUnit,
            )} ${maxWidthLabel}: ${formatNumber(layout.resizableByUser.maxWidth, measurementUnit)}`;
        }
        if (layout?.resizableByUser.minWidth) {
            return `${minWidthLabel}: ${formatNumber(layout.resizableByUser.minWidth, measurementUnit)}`;
        }
        if (layout?.resizableByUser.maxWidth) {
            return `${maxWidthLabel}: ${formatNumber(layout.resizableByUser.maxWidth, measurementUnit)}`;
        }
        return undefined;
    }, [layout, measurementUnit, minWidthLabel, maxWidthLabel]);

    const heightInputHelpText = useMemo(() => {
        if (layout?.resizableByUser.minHeight && layout?.resizableByUser.maxHeight) {
            return `${minHeightLabel}: ${formatNumber(
                layout.resizableByUser.minHeight,
                measurementUnit,
            )} ${maxHeightLabel}: ${formatNumber(layout.resizableByUser.maxHeight, measurementUnit)}`;
        }
        if (layout?.resizableByUser.minHeight) {
            return `${minHeightLabel}: ${formatNumber(layout.resizableByUser.minHeight, measurementUnit)}`;
        }
        if (layout?.resizableByUser.maxHeight) {
            return `${maxHeightLabel}: ${formatNumber(layout.resizableByUser.maxHeight, measurementUnit)}`;
        }
        return undefined;
    }, [layout, measurementUnit, minHeightLabel, maxHeightLabel]);

    const saveChange = useCallback(
        async (name: string, value: string) => {
            switch (name) {
                case 'width': {
                    handleSetProperty(
                        /**
                         if the same value is set twice, 
                         on first try it pageSizeChanged event is emitted and input updated with unit
                         on second try, since no real changes are made to pageSize, engine will not emit PageSizeChanged event
                         this way we manually set measurement unit after successful SDK update
                         */
                        async () => {
                            await window.StudioUISDK.page.setWidth(activePageDetails?.id as string, value);
                            setPageWidth(withMeasurementUnit(activePageDetails?.width as number, measurementUnit));
                            return null;
                        },
                        // reset to previous valid width with measurement unit
                        () =>
                            setPageWidth(
                                activePageDetails?.width
                                    ? withMeasurementUnit(activePageDetails?.width as number, measurementUnit)
                                    : '',
                            ),
                    );
                    setPageWidth(value);
                    break;
                }
                case 'height': {
                    handleSetProperty(
                        /** same for height
                         if the same value is set twice, on first try it pageSizeChanged event is emitted and input updated with unit
                         on second try, since no real changes are made to pageSize, engine will not emit PageSizeChanged event
                         this way we manually set measurement unit after successful SDK update
                         */
                        async () => {
                            await window.StudioUISDK.page.setHeight(activePageDetails?.id as string, value);
                            setPageHeight(withMeasurementUnit(activePageDetails?.height as number, measurementUnit));
                            return null;
                        },
                        // reset to previous valid width with measurement unit
                        () =>
                            setPageHeight(
                                activePageDetails?.height
                                    ? withMeasurementUnit(activePageDetails?.height as number, measurementUnit)
                                    : '',
                            ),
                    );
                    setPageHeight(value);
                    break;
                }
                default:
                    break;
            }
        },
        [measurementUnit, activePageDetails?.id, activePageDetails?.width, activePageDetails?.height],
    );

    useEffect(() => {
        if (measurementUnit) {
            const formattedPageWidth = activePageDetails?.width
                ? withMeasurementUnit(activePageDetails.width, measurementUnit)
                : '';
            const formattedPageHeight = activePageDetails?.height
                ? withMeasurementUnit(activePageDetails.height, measurementUnit)
                : '';
            setPageWidth(formattedPageWidth);
            setPageHeight(formattedPageHeight);
        }
    }, [activePageDetails, measurementUnit]);

    return { saveChange, pageWidth, pageHeight, widthInputHelpText, heightInputHelpText, setPageWidth, setPageHeight };
};
