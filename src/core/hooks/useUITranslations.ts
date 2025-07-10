import { useSelector } from 'react-redux';
import { selectUITranslations } from 'src/store/reducers/appConfigReducer';
import { useCallback } from 'react';
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

    const getUITranslation = useCallback(
        (path: ValidTranslationPaths, fallback: string, replacements?: Record<string, string>): string => {
            const result = path.reduce((obj, key) => {
                if (obj && typeof obj === 'object' && key in obj) {
                    return (obj as Record<string, unknown>)[key];
                }
                return undefined;
            }, uiTranslations as unknown) as string | undefined;

            const translation = result || fallback;

            if (replacements) {
                return translation.replace(/\{\{(\w+)\}\}/g, (match, key) => {
                    return replacements[key] || match;
                });
            }

            return translation;
        },
        [uiTranslations],
    );

    return {
        getUITranslation,
    };
};
