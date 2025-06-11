import type { Direction } from '../store/reducers/directionReducer';

export const getDirectionalStyle = (
    ltrValue: string | number,
    rtlValue: string | number,
    direction: Direction,
): string | number => {
    return direction === 'ltr' ? ltrValue : rtlValue;
};

export const getDirectionalClassName = (ltrClass: string, rtlClass: string, direction: Direction): string => {
    return direction === 'ltr' ? ltrClass : rtlClass;
};

export const getDirectionalMargin = (
    direction: Direction,
    value: string | number,
): { marginLeft?: string | number; marginRight?: string | number } => {
    return direction === 'ltr' ? { marginRight: value } : { marginLeft: value };
};

export const getDirectionalPadding = (
    direction: Direction,
    value: string | number,
): { paddingLeft?: string | number; paddingRight?: string | number } => {
    return direction === 'ltr' ? { paddingRight: value } : { paddingLeft: value };
};
