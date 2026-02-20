import { Frame, SelectedTextStyle } from '@chili-publish/studio-sdk';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

type FramesState = {
    selectedFrameContent: Frame | null;
    selectedTextProperties: SelectedTextStyle | null;
};

const initialState: FramesState = {
    selectedFrameContent: null,
    selectedTextProperties: null,
};
export const framesSlice = createSlice({
    name: 'frames',
    initialState,
    reducers: {
        setSelectedFrameContent: (state, action: PayloadAction<Frame | null>) => {
            state.selectedFrameContent = action.payload;
        },
        setSelectedTextProperties: (state, action: PayloadAction<SelectedTextStyle | null>) => {
            state.selectedTextProperties = action.payload;
        },
    },
});

// Actions
export const { setSelectedFrameContent, setSelectedTextProperties } = framesSlice.actions;

// Selectors
export const selectedFrameContent = (state: RootState): Frame | null => state.frames.selectedFrameContent ?? null;
export const selectedTextProperties = (state: RootState): SelectedTextStyle | null =>
    state.frames.selectedTextProperties ?? null;
export default framesSlice.reducer;
