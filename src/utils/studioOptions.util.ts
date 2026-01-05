import { FrameEditingMode } from '@chili-publish/studio-sdk';

const defaultShortcutOptions = {
    debugPanel: { enabled: false },
    ellipse: { enabled: false },
    hand: { enabled: true },
    image: { enabled: false },
    polygon: { enabled: false },
    rectangle: { enabled: false },
    select: { enabled: false },
    text: { enabled: false },
    zoom: { enabled: false },
    viewMode: { enabled: false },
};

export const defaultStudioOptions = {
    shortcutOptions: defaultShortcutOptions,
    frameEditingMode: FrameEditingMode.followConstraints,
};
