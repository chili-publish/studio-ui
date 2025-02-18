import { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutPropertiesType, MeasurementUnit, PageSize } from '@chili-publish/studio-sdk';
import { formatNumber, handleSetProperty } from './utils';

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
                        () => window.StudioUISDK.page.setWidth(activePageDetails?.id as string, value),
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
                    setPageWidth(
                        activePageDetails?.width
                            ? `${formatNumber(activePageDetails?.width as number, measurementUnit)} ${measurementUnit}`
                            : '',
                    );
                    break;
                }
                case 'height': {
                    handleSetProperty(
                        () => window.StudioUISDK.page.setHeight(activePageDetails?.id as string, value),
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
                    setPageHeight(
                        activePageDetails?.height
                            ? `${formatNumber(activePageDetails?.height as number, measurementUnit)} ${measurementUnit}`
                            : '',
                    );
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
