import {
    ColorGrid,
    ColorGridType,
    ModalLayout,
    ModalSize,
    useOnClickOutside,
} from '@chili-publish/grafx-shared-components';
import { FrameConstraints } from '@chili-publish/studio-sdk';
import { useRef } from 'react';
import { getDataIdForSUI, getDataTestIdForSUI } from 'src/utils/dataIds';
import { APP_WRAPPER_ID } from 'src/utils/constants';
import useAllowedColorStyles from '../../_shared/useAllowedColorStyles';
import { SelectColorLabel, StyledColorGrid } from '../../_shared/InlineTextEditing.styles';

const STYLE_COLOR_PICKER_DIALOG_ID = 'style-color-picker-dialog';

interface ColorPickerModalProps {
    frameConstraints: FrameConstraints | null;
    position: { left: number; top: number } | null;
    onClose: () => void;
}
const ColorPickerModal = ({ frameConstraints, position, onClose }: ColorPickerModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

    const { colorGridColors, handleColorSelection } = useAllowedColorStyles(frameConstraints);

    const selectColor = async (color: ColorGridType) => {
        await handleColorSelection(color);
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
            <ModalLayout.Title>Color</ModalLayout.Title>
            <ModalLayout.Body>
                <StyledColorGrid>
                    <ColorGrid
                        colors={colorGridColors}
                        onClick={selectColor}
                        emptyStateMessage="Any colors added to the Brand Kit will be available here."
                    />
                    {colorGridColors.length ? <SelectColorLabel>Select a color</SelectColorLabel> : null}
                </StyledColorGrid>
            </ModalLayout.Body>
        </ModalLayout.Container>
    );
};

export default ColorPickerModal;
