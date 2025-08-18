import { useState } from 'react';
import { ConstraintMode, LayoutPropertiesType } from '@chili-publish/studio-sdk';
import { handleSetProperty } from '../../utils/formatNumber';

export const useLayoutConstraintProportions = (layout: LayoutPropertiesType, pageWidth: string, pageHeight: string) => {
    const hasLockedConstraint = layout?.resizableByUser.constraintMode === ConstraintMode.locked;
    const hasRangeConstraint =
        layout?.resizableByUser.constraintMode === ConstraintMode.range &&
        (layout?.resizableByUser.minAspect || layout?.resizableByUser.maxAspect);

    const [formHasError, setFormHasError] = useState(false);
    const [formHasChanges, setFormHasChanges] = useState(false);

    const handleSubmitChanges = async () => {
        setFormHasError(false);
        setFormHasChanges(false);

        handleSetProperty(
            async () => {
                await window.StudioUISDK.page.setSize(pageWidth, pageHeight);
                return null;
            },
            () => {
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
