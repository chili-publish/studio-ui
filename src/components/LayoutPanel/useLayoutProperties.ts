import { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutPropertiesType, MeasurementUnit, PageSize } from '@chili-publish/studio-sdk';
import { formatNumber, handleSetProperty } from '../../utils/formatNumber';

export const useLayoutProperties = (layout: LayoutPropertiesType, activePageDetails?: PageSize) => {
    const [pageWidth, setPageWidth] = useState<string>('');
    const [pageHeight, setPageHeight] = useState<string>('');

    const measurementUnit = useMemo(() => {
        return ((layout?.unit as Record<string, unknown>).value as MeasurementUnit) || '';
    }, [layout]);

    const handleChange = useCallback(
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
                            setPageWidth(
                                `${formatNumber(
                                    activePageDetails?.width as number,
                                    measurementUnit,
                                )} ${measurementUnit}`,
                            );
                            return null;
                        },
                        // reset to previous valid width with measurement unit
                        () =>
                            setPageWidth(
                                activePageDetails?.width
                                    ? `${formatNumber(
                                          activePageDetails?.width as number,
                                          measurementUnit,
                                      )} ${measurementUnit}`
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
                            setPageHeight(
                                `${formatNumber(
                                    activePageDetails?.height as number,
                                    measurementUnit,
                                )} ${measurementUnit}`,
                            );
                            return null;
                        },
                        // reset to previous valid width with measurement unit
                        () =>
                            setPageHeight(
                                activePageDetails?.height
                                    ? `${formatNumber(
                                          activePageDetails?.height as number,
                                          measurementUnit,
                                      )} ${measurementUnit}`
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
                ? `${formatNumber(activePageDetails?.width as number, measurementUnit)} ${measurementUnit}`
                : '';
            const formattedPageHeight = activePageDetails?.height
                ? `${formatNumber(activePageDetails?.height as number, measurementUnit)} ${measurementUnit}`
                : '';
            setPageWidth(formattedPageWidth);
            setPageHeight(formattedPageHeight);
        }
    }, [activePageDetails, measurementUnit]);

    return { handleChange, pageWidth, pageHeight };
};
