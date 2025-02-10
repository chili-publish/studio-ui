import { useCallback, useEffect, useState } from 'react';
import { LayoutPropertiesType, MeasurementUnit } from '@chili-publish/studio-sdk';
import { formatNumber, handleSetProperty } from './utils';

export const useLayoutProperties = (layout: LayoutPropertiesType) => {
    const [layoutWidth, setLayoutWidth] = useState<string>('');
    const [layoutHeight, setLayoutHeight] = useState<string>('');
    const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>();

    const handleChange = useCallback(
        async (name: string, value: string) => {
            switch (name) {
                case 'width': {
                    setLayoutWidth(value);
                    handleSetProperty(
                        () => window.StudioUISDK.layout.setWidth(layout?.id as string, value),
                        () =>
                            setLayoutWidth(
                                `${formatNumber(layout?.width.value as number, measurementUnit)} ${measurementUnit}`,
                            ),
                    );
                    break;
                }
                case 'height': {
                    setLayoutHeight(value);
                    handleSetProperty(
                        () => window.StudioUISDK.layout?.setHeight(layout?.id as string, value),
                        () =>
                            setLayoutHeight(
                                `${formatNumber(layout?.height.value as number, measurementUnit)} ${measurementUnit}`,
                            ),
                    );
                    break;
                }
                default:
                    break;
            }
        },
        [measurementUnit, layout?.width.value, layout?.height.value, layout?.id],
    );

    useEffect(() => {
        if (layout?.id && layout?.unit) {
            const unit = layout.unit as Record<string, unknown>;
            if ('value' in unit) {
                setMeasurementUnit(unit.value as MeasurementUnit);
            }
        }
    }, [layout?.id, layout?.unit]);

    useEffect(() => {
        if (measurementUnit) {
            const formattedWidth = `${formatNumber(
                layout?.width?.value as number,
                measurementUnit,
            )} ${measurementUnit}`;
            const formattedHeight = `${formatNumber(
                layout?.height?.value as number,
                measurementUnit,
            )} ${measurementUnit}`;
            setLayoutWidth(formattedWidth);
            setLayoutHeight(formattedHeight);
        }
    }, [measurementUnit, layout?.width.value, layout?.height.value]);

    return { handleChange, layoutWidth, layoutHeight };
};
