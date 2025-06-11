import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setDirection } from '../store/reducers/directionReducer';
import type { Direction } from '../store/reducers/directionReducer';

export const useDirection = () => {
    const dispatch = useAppDispatch();
    const { direction, isRTL, icons, styles } = useAppSelector((state) => state.direction);

    const updateDirection = useCallback(
        (newDirection: Direction) => {
            dispatch(setDirection(newDirection));
        },
        [dispatch],
    );

    return {
        direction,
        isRTL,
        icons,
        styles,
        updateDirection,
    };
};
