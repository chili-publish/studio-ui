import { useRef, useState } from 'react';

const useColorModalPosition = () => {
    const colorContainerRef = useRef<HTMLDivElement>(null);

    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [colorModalPosition, setColorModalPosition] = useState<{ left: number; top: number } | null>(null);

    const openColorPicker = () => {
        const SPACING = 15;
        const colorElement = colorContainerRef.current;
        if (colorElement) {
            const { left, right, top } = colorElement.getBoundingClientRect();
            if (window.innerWidth - left >= 340) {
                setColorModalPosition({ left: left, top: top + colorElement.offsetHeight + SPACING });
            } else {
                setColorModalPosition({ left: right - 340, top: top + colorElement.offsetHeight + SPACING });
            }
        }
        setIsColorPickerOpen(true);
    };

    return {
        isColorPickerOpen,
        colorModalPosition,
        colorContainerRef,
        openColorPicker,
        closeColorPicker: () => setIsColorPickerOpen(false),
    };
};

export default useColorModalPosition;
