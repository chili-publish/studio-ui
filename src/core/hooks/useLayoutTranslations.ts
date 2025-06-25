import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectLayoutTranslations } from '../../store/reducers/appConfigReducer';

export const useLayoutTranslations = () => {
    const layoutTranslations = useSelector(selectLayoutTranslations);

    const getTranslatedLayoutDisplayName = useCallback(
        (layout: { displayName?: string | null; name: string }): string => {
            let translation = layout.displayName ? layoutTranslations?.[layout.displayName] : undefined;
            if (!translation) {
                translation = layoutTranslations?.[layout.name];
            }
            return translation?.displayName || layout.displayName || layout.name;
        },
        [layoutTranslations],
    );

    return {
        getTranslatedLayoutDisplayName,
    };
};
