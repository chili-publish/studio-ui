import { useSelector } from 'react-redux';
import { selectUITranslations } from 'src/store/reducers/appConfigReducer';

export const useUITranslations = () => {
    const uiTranslations = useSelector(selectUITranslations);

    // Helper to get a translation for a given path, e.g. ['formBuilder', 'variables', 'header']
    const getUITranslation = (...path: string[]): string | undefined => {
        return path.reduce((obj, key) => {
            if (obj && typeof obj === 'object' && key in obj) {
                return (obj as Record<string, unknown>)[key];
            }
            return undefined;
        }, uiTranslations as unknown) as string | undefined;
    };

    return {
        uiTranslations,
        getUITranslation,
    };
};
