import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AvailableIcons } from '@chili-publish/grafx-shared-components';
import type { RootState } from '../index';

export type Direction = 'ltr' | 'rtl';

interface DirectionState {
    direction: Direction;
    isRTL: boolean;
    icons: {
        back: (typeof AvailableIcons)[keyof typeof AvailableIcons];
        forward: (typeof AvailableIcons)[keyof typeof AvailableIcons];
    };
    styles: {
        start: 'left' | 'right';
        end: 'left' | 'right';
        marginStart: 'margin-inline-start';
        marginEnd: 'margin-inline-end';
        paddingStart: 'padding-inline-start';
        paddingEnd: 'padding-inline-end';
        textAlign: 'left' | 'right';
    };
}

const initialState: DirectionState = {
    direction: 'ltr',
    isRTL: false,
    icons: {
        back: AvailableIcons.faArrowLeft,
        forward: AvailableIcons.faArrowRight,
    },
    styles: {
        start: 'left',
        end: 'right',
        marginStart: 'margin-inline-start',
        marginEnd: 'margin-inline-end',
        paddingStart: 'padding-inline-start',
        paddingEnd: 'padding-inline-end',
        textAlign: 'left',
    },
};

const directionSlice = createSlice({
    name: 'direction',
    initialState,
    reducers: {
        setDirection: (state, action: PayloadAction<Direction>) => {
            const isRTL = action.payload === 'rtl';
            state.direction = action.payload;
            state.isRTL = isRTL;
            state.icons = {
                back: isRTL ? AvailableIcons.faArrowRight : AvailableIcons.faArrowLeft,
                forward: isRTL ? AvailableIcons.faArrowLeft : AvailableIcons.faArrowRight,
            };
            state.styles = {
                start: isRTL ? 'right' : 'left',
                end: isRTL ? 'left' : 'right',
                marginStart: 'margin-inline-start',
                marginEnd: 'margin-inline-end',
                paddingStart: 'padding-inline-start',
                paddingEnd: 'padding-inline-end',
                textAlign: isRTL ? 'right' : 'left',
            };
        },
    },
});

export const { setDirection } = directionSlice.actions;

export const selectDirection = (state: RootState): Direction => state.direction.direction;

export default directionSlice.reducer;
