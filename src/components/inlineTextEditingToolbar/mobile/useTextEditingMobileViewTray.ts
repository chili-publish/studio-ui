import { useState } from 'react';

export enum TextEditingMobileViewTrayView {
    PARAGRAPH_STYLE = 'paragraphStyle',
    CHARACTER_STYLE = 'characterStyle',
    FONT_SIZE = 'fontSize',
    COLOR = 'color',
}
const useTextEditingMobileViewTray = () => {
    const [currentView, setCurrentView] = useState<TextEditingMobileViewTrayView | null>(null);
    return {
        currentView,
        isViewOpen: !!currentView,
        openView: (view: TextEditingMobileViewTrayView) => setCurrentView(view),
        closeView: () => setCurrentView(null),
    };
};

export default useTextEditingMobileViewTray;
