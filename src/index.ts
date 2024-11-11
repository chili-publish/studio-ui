import StudioUI from './main';

declare global {
    interface Window {
        StudioUI: typeof StudioUI;
    }
}

// This is an entry file for 'iife' format
window.StudioUI = StudioUI;
