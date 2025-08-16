import { useState } from 'react';
import { PageSize } from '@chili-publish/studio-sdk';

export const useLayoutConstraintProportions = (
    pageSize: PageSize | undefined,
    pageWidth: string,
    pageHeight: string,
) => {
    const [formHasError, setFormHasError] = useState(false);
    const [formHasChanges, setFormHasChanges] = useState(false);

    return {
        formHasChanges,
        setFormHasChanges,
        formHasError,
        setFormHasError,
    };
};
