import { FrameConstraints } from '@chili-publish/studio-sdk';
import StudioDropdown from '../../../shared/StudioDropdown';
import { useAppSelector } from 'src/store';
import { selectedTextProperties } from 'src/store/reducers/frameReducer';
import { AvailableIcons, Icon } from '@chili-publish/grafx-shared-components';
import { ConstraintWrapper } from '../InlineTextEditingToolbar.styles';
import useAllowedParagraphStyles from '../../_shared/useAllowedParagraphStyles';

const ParagraphStyleConstraint = ({ frameConstraints }: { frameConstraints: FrameConstraints | null }) => {
    const textStyle = useAppSelector(selectedTextProperties);
    const { options, handleChange } = useAllowedParagraphStyles(frameConstraints);

    return (
        <ConstraintWrapper>
            <Icon icon={AvailableIcons.faParagraph} />
            <StudioDropdown
                id="paragraph-style-constraint"
                dataId={'paragraph-style-constraint'}
                selectedValue={options.find((option) => option.value === textStyle?.paragraphStyleId)}
                options={options}
                onChange={handleChange}
            />
        </ConstraintWrapper>
    );
};

export default ParagraphStyleConstraint;
