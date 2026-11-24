const RECENT_POINTER_MS = 20;
const guardedWindows = new WeakSet<Window>();

type GuardedWindow = Window & {
    HTMLElement: typeof HTMLElement;
};

const isFirefoxFrame = (win: Window) => /firefox/i.test(win.navigator.userAgent);

const isBlobFrame = (win: Window) => {
    try {
        return win.location.href.startsWith('blob:');
    } catch {
        return false;
    }
};

const parentKeepsFocus = (iframe: HTMLIFrameElement, lastPointerDown: number) =>
    document.activeElement !== iframe && Date.now() - lastPointerDown > RECENT_POINTER_MS;

const guardFrame = (iframe: HTMLIFrameElement, win: GuardedWindow) => {
    if (guardedWindows.has(win) || !isFirefoxFrame(win) || !isBlobFrame(win)) return;

    // Firefox gives a same-origin iframe focus when the engine calls focus().
    // Firefox browsers report the focus changes in a slightly different order than chrome browser.
    // This difference forces engine to call focus() a second time while field is already focused, thus losing input focus.
    guardedWindows.add(win);
    let lastPointerDown = 0;
    win.document.addEventListener(
        'pointerdown',
        () => {
            lastPointerDown = Date.now();
        },
        true,
    );

    const elementPrototype = win.HTMLElement.prototype;
    const originalElementFocus = elementPrototype.focus;
    elementPrototype.focus = function focus(this: HTMLElement, ...args: Parameters<HTMLElement['focus']>) {
        if (parentKeepsFocus(iframe, lastPointerDown)) return undefined;
        return originalElementFocus.apply(this, args);
    };

    const frameWindow = win;
    const originalWindowFocus = frameWindow.focus.bind(frameWindow);
    frameWindow.focus = () => {
        if (parentKeepsFocus(iframe, lastPointerDown)) return undefined;
        return originalWindowFocus();
    };
};

//TODO: remove this workaround when engine moves to new flutter architecture
export const blockEngineFocusSteal = (iframe: HTMLIFrameElement): (() => void) => {
    const patch = () => {
        const win = iframe.contentWindow as GuardedWindow | null;
        if (!win) return;
        guardFrame(iframe, win);
    };

    patch();
    iframe.addEventListener('load', patch);
    return () => iframe.removeEventListener('load', patch);
};
