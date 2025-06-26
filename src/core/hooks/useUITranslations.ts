import { useSelector } from 'react-redux';
import { selectUITranslations } from 'src/store/reducers/appConfigReducer';

export const useUITranslations = () => {
    const uiTranslations = useSelector(selectUITranslations);

    // Helper to get a translation for a given path, e.g. ['formBuilder', 'variables', 'header']
    const getUITranslation = (...path: string[]): string | undefined => {
        return path.reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined), uiTranslations as any);
    };

    return {
        uiTranslations,
        getUITranslation,
    };
};
