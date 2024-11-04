export const isMac = /Macintosh/.test(navigator.userAgent);

const shiftKeySymbol = isMac ? '⇧' : 'Shift';
const commandKeySymbol = isMac ? '⌘' : 'Ctrl';
const currentOs = isMac ? 'mac' : 'windows';

const shortcuts = {
    save: {
        mac: `${commandKeySymbol}S`,
        windows: `${commandKeySymbol}+S`,
    },
    saveAs: {
        mac: `${shiftKeySymbol}${commandKeySymbol}S`,
        windows: `${shiftKeySymbol}+${commandKeySymbol}+S`,
    },
    undo: {
        mac: `${commandKeySymbol}Z`,
        windows: `${commandKeySymbol}+Z`,
    },
    redo: {
        mac: `${shiftKeySymbol}${commandKeySymbol}Z`,
        windows: `${shiftKeySymbol}+${commandKeySymbol}+Z`,
    },
    copy: {
        mac: `${commandKeySymbol}C`,
        windows: `${commandKeySymbol}+C`,
    },
    cut: {
        mac: `${commandKeySymbol}X`,
        windows: `${commandKeySymbol}+X`,
    },
    paste: {
        mac: `${commandKeySymbol}V`,
        windows: `${commandKeySymbol}+V`,
    },
    duplicate: {
        mac: `${commandKeySymbol}D`,
        windows: `${commandKeySymbol}+D`,
    },
    export: {
        mac: `${commandKeySymbol}E`,
        windows: `${commandKeySymbol}+E`,
    },
    zoomIn: {
        mac: `${commandKeySymbol}+`,
        windows: `${commandKeySymbol}++`,
    },
    zoomOut: {
        mac: `${commandKeySymbol} -`,
        windows: `${commandKeySymbol}+ -`,
    },
    zoomToPage: {
        mac: `${shiftKeySymbol}1`,
        windows: `${shiftKeySymbol}+1`,
    },
    zoomTo100: {
        mac: `${shiftKeySymbol}0`,
        windows: `${shiftKeySymbol}+0`,
    },
};

export const getShortcut = (action: keyof typeof shortcuts) => {
    return shortcuts[action][currentOs];
};
