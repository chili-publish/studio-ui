import { useCallback, useEffect, useState } from 'react';
import { LayoutPropertiesType, MeasurementUnit, Page } from '@chili-publish/studio-sdk';
import { formatNumber, handleSetProperty } from './utils';

export const useLayoutProperties = (layout: LayoutPropertiesType, activePageDetails?: Page) => {
    const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>();

    const [pageWidth, setPageWidth] = useState<string>('');
    const [pageHeight, setPageHeight] = useState<string>('');
    const handleChange = useCallback(
        async (name: string, value: string) => {
            switch (name) {
                case 'width': {
                    setPageWidth(value);
                    handleSetProperty(
                        () => window.StudioUISDK.page.setWidth(activePageDetails?.id as string, value),
                        () =>
                            setPageWidth(
                                `${formatNumber(
                                    activePageDetails?.width as number,
                                    measurementUnit,
                                )} ${measurementUnit}`,
                            ),
                    );
                    break;
                }
                case 'height': {
                    setPageHeight(value);
                    handleSetProperty(
                        () => window.StudioUISDK.page.setHeight(activePageDetails?.id as string, value),
                        () =>
                            setPageHeight(
                                `${formatNumber(
                                    activePageDetails?.height as number,
                                    measurementUnit,
                                )} ${measurementUnit}`,
                            ),
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
        if (layout?.id && layout?.unit) {
            const unit = layout.unit as Record<string, unknown>;
            if ('value' in unit) {
                setMeasurementUnit(unit.value as MeasurementUnit);
            }
        }

        // Set default page dimensions if not set;
        const setDefaultDimension = async (dimension: 'width' | 'height') => {
            switch (dimension) {
                case 'width':
                    await window.StudioUISDK.page.setWidth(activePageDetails?.id as string, '1');
                    break;
                case 'height':
                    await window.StudioUISDK.page.setHeight(activePageDetails?.id as string, '1');
                    break;
                default:
                    break;
            }
        };

        // width and height can be null from engine;
        if (activePageDetails?.width === null) {
            setDefaultDimension('width');
        }
        if (activePageDetails?.height === null) {
            setDefaultDimension('height');
        }
    }, [layout?.id, layout?.unit, activePageDetails?.width, activePageDetails?.height, activePageDetails?.id]);

    useEffect(() => {
        if (measurementUnit) {
            const formattedPageWidth = `${formatNumber(
                (activePageDetails?.width ?? 0) as number,
                measurementUnit,
            )} ${measurementUnit}`;
            const formattedPageHeight = `${formatNumber(
                (activePageDetails?.height ?? 0) as number,
                measurementUnit,
            )} ${measurementUnit}`;
            setPageWidth(formattedPageWidth);
            setPageHeight(formattedPageHeight);
        }
    }, [measurementUnit, activePageDetails?.width, activePageDetails?.height]);

    return { handleChange, pageWidth, pageHeight };
};
