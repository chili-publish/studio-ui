import { useSelector } from 'react-redux';
import { selectUITranslations } from 'src/store/reducers/appConfigReducer';
import { UITranslations } from '../../types/UITranslations';

type Primitive = string | number | boolean | symbol | null | undefined;

type Path<T> = T extends Primitive
    ? []
    : {
          [K in keyof T & string]: T[K] extends Primitive ? [K] : [K] | [K, ...Path<T[K]>];
      }[keyof T & string];

type ValidTranslationPaths = Path<UITranslations>;

export const useUITranslations = () => {
    const uiTranslations = useSelector(selectUITranslations);

    function getUITranslation({
        path,
        fallback,
    }: {
        path: ValidTranslationPaths;
        fallback?: string;
    }): string | undefined {
        const result = path.reduce((obj, key) => {
            if (obj && typeof obj === 'object' && key in obj) {
                return (obj as Record<string, unknown>)[key];
            }
            return undefined;
        }, uiTranslations as unknown) as string | undefined;

        return result || fallback;
    }

    return {
        getUITranslation,
    };
};
