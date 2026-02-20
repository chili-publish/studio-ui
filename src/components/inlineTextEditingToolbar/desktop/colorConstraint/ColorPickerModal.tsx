import {
    ColorGrid,
    ColorGridType,
    ModalLayout,
    ModalSize,
    useOnClickOutside,
} from '@chili-publish/grafx-shared-components';
import { DocumentColor, SelectedTextStyles, TextStyleUpdateType } from '@chili-publish/studio-sdk';
import { useRef } from 'react';
import { getDataIdForSUI, getDataTestIdForSUI } from 'src/utils/dataIds';
import { toColorPickerColor } from './color.util';
import { APP_WRAPPER_ID } from 'src/utils/constants';
import { SelectColorLabel } from './Color.styles';

const STYLE_COLOR_PICKER_DIALOG_ID = 'style-color-picker-dialog';

interface ColorPickerModalProps {
    colors: DocumentColor[];
    position: { left: number; top: number } | null;
    onClose: () => void;
}
const ColorPickerModal = ({ colors, position, onClose }: ColorPickerModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

    const colorGridColors = colors.map((color) => ({
        colorValue: toColorPickerColor(color),
        name: color.name,
        id: color.id,
    }));

    const handleColorSelection = async (color: ColorGridType) => {
        await window.StudioUISDK.textSelection.set({
            [SelectedTextStyles.COLOR]: { value: color.colorValue },
        } as TextStyleUpdateType);
        onClose();
    };

    useOnClickOutside(modalRef, onClose);
    return (
        <ModalLayout.Container
            ref={modalRef}
            id={STYLE_COLOR_PICKER_DIALOG_ID}
            key={STYLE_COLOR_PICKER_DIALOG_ID}
            dataId={getDataIdForSUI(STYLE_COLOR_PICKER_DIALOG_ID)}
            dataTestId={getDataTestIdForSUI(STYLE_COLOR_PICKER_DIALOG_ID)}
            isVisible
            isDraggable
            size={ModalSize.ES}
            anchorId={APP_WRAPPER_ID}
            positionOnOpen={{
                left: position?.left || 0,
                top: position?.top || 0,
                right: 'unset',
                bottom: 'unset',
            }}
            onClose={onClose}
        >
            <ModalLayout.Title>Brand Kit Color</ModalLayout.Title>
            <ModalLayout.Body>
                <ColorGrid
                    colors={colorGridColors}
                    onClick={handleColorSelection}
                    emptyStateMessage="Any colors added to the Brand Kit will be available here."
                />
                {colors.length ? <SelectColorLabel>Select a color</SelectColorLabel> : null}
            </ModalLayout.Body>
        </ModalLayout.Container>
    );
};

export default ColorPickerModal;
