import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export type Direction = 'ltr' | 'rtl';

interface DirectionState {
    direction: Direction;
}

const initialState: DirectionState = {
    direction: 'ltr',
};

const directionSlice = createSlice({
    name: 'direction',
    initialState,
    reducers: {
        setDirection: (state, action: PayloadAction<Direction>) => {
            state.direction = action.payload;
        },
    },
});

export const { setDirection } = directionSlice.actions;

export const selectDirection = (state: RootState): Direction => state.direction.direction;

export default directionSlice.reducer;
