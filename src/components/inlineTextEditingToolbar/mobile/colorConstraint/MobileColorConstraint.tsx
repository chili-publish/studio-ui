import { FrameConstraints } from '@chili-publish/studio-sdk';
import useAllowedColorStyles from '../../_shared/useAllowedColorStyles';
import { ColorGrid } from '@chili-publish/grafx-shared-components';
import { SelectColorLabel, StyledColorGrid } from '../../_shared/InlineTextEditing.styles';

const MobileColorConstraint = ({ frameConstraints }: { frameConstraints: FrameConstraints | null }) => {
    const { colorGridColors, handleColorSelection } = useAllowedColorStyles(frameConstraints);

    return (
        <StyledColorGrid>
            <ColorGrid
                colors={colorGridColors}
                onClick={handleColorSelection}
                emptyStateMessage="Any colors added to the Brand Kit will be available here."
            />
            {colorGridColors.length ? <SelectColorLabel>Select a color</SelectColorLabel> : null}
        </StyledColorGrid>
    );
};

export default MobileColorConstraint;
