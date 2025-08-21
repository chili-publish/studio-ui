import { useEffect, useState } from 'react';
import { ConstraintMode, LayoutPropertiesType } from '@chili-publish/studio-sdk';
import { handleSetProperty } from '../../utils/formatNumber';

interface UseLayoutConstraintProportionsProps {
    layout: LayoutPropertiesType;
    pageWidth: string;
    pageHeight: string;
}
export const useLayoutConstraintProportions = ({
    layout,
    pageWidth,
    pageHeight,
}: UseLayoutConstraintProportionsProps) => {
    const hasLockedConstraint = layout?.resizableByUser.constraintMode === ConstraintMode.locked;
    const hasRangeConstraint =
        layout?.resizableByUser.constraintMode === ConstraintMode.range &&
        (layout?.resizableByUser.minAspect || layout?.resizableByUser.maxAspect);

    const [formHasError, setFormHasError] = useState(false);
    const [formHasChanges, setFormHasChanges] = useState(false);

    useEffect(() => {
        setFormHasError(false);
        setFormHasChanges(false);
    }, [layout]);

    const handleSubmitChanges = async () => {
        handleSetProperty(
            async () => {
                await window.StudioUISDK.page.setSize(pageWidth, pageHeight);

                setFormHasError(false);
                setFormHasChanges(false);

                return null;
            },
            async () => {
                setFormHasError(true);
            },
        );
    };

    return {
        formHasChanges,
        setFormHasChanges,
        formHasError,
        setFormHasError,
        handleSubmitChanges,
        hasLockedConstraint,
        hasRangeConstraint,
    };
};
