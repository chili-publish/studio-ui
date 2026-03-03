import { Frame, FrameLayoutType, SelectedTextStyle } from '@chili-publish/studio-sdk';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

type FramesState = {
    selectedFrameContent: Frame | null;
    selectedTextProperties: SelectedTextStyle | null;
    selectedFrameLayouts: FrameLayoutType[] | null;
};

const initialState: FramesState = {
    selectedFrameContent: null,
    selectedTextProperties: null,
    selectedFrameLayouts: null,
};
export const framesSlice = createSlice({
    name: 'frames',
    initialState,
    reducers: {
        setSelectedFrameContent: (state, action: PayloadAction<Frame | null>) => {
            state.selectedFrameContent = action.payload;
        },
        setSelectedFrameLayouts: (state, action: PayloadAction<FrameLayoutType[] | null>) => {
            state.selectedFrameLayouts = action.payload;
        },
        setSelectedTextProperties: (state, action: PayloadAction<SelectedTextStyle | null>) => {
            state.selectedTextProperties = action.payload;
        },
    },
});

// Actions
export const { setSelectedFrameContent, setSelectedTextProperties, setSelectedFrameLayouts } = framesSlice.actions;

// Selectors
export const selectedFrameContent = (state: RootState): Frame | null => state.frames.selectedFrameContent ?? null;
export const selectedTextProperties = (state: RootState): SelectedTextStyle | null =>
    state.frames.selectedTextProperties ?? null;
export const selectedFrameLayouts = (state: RootState): FrameLayoutType[] | null =>
    state.frames.selectedFrameLayouts ?? null;
export const selectedFrameLayout = (state: RootState): FrameLayoutType | null =>
    state.frames.selectedFrameLayouts?.[0] ?? null;

export default framesSlice.reducer;
