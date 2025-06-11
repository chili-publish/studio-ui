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
): { marginInlineStart?: string | number; marginInlineEnd?: string | number } => {
    return direction === 'ltr' ? { marginInlineEnd: value } : { marginInlineStart: value };
};

export const getDirectionalPadding = (
    direction: Direction,
    value: string | number,
): { paddingInlineStart?: string | number; paddingInlineEnd?: string | number } => {
    return direction === 'ltr' ? { paddingInlineEnd: value } : { paddingInlineStart: value };
};
