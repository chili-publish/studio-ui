import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store';
import { selectDirection, setDirection } from '../store/reducers/directionReducer';
import type { Direction } from '../store/reducers/directionReducer';

export const useDirection = () => {
    const dispatch = useAppDispatch();
    const direction = useSelector(selectDirection);

    const updateDirection = useCallback(
        (newDirection: Direction) => {
            dispatch(setDirection(newDirection));
        },
        [dispatch],
    );

    return {
        direction,
        updateDirection,
    };
};
