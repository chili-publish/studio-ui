import { FrameConstraints } from '@chili-publish/studio-sdk';
import { ConstraintWrapper } from '../InlineTextEditingToolbar.styles';
import { AvailableIcons, Icon } from '@chili-publish/grafx-shared-components';
import StudioDropdown from '../../../shared/StudioDropdown';
import useAllowedCharacterStyles from '../../_shared/useAllowedCharacterStyles';
import { useAppSelector } from 'src/store';
import { selectedTextProperties } from 'src/store/reducers/frameReducer';

const CharacterStyleConstraint = ({ frameConstraints }: { frameConstraints: FrameConstraints | null }) => {
    const textStyle = useAppSelector(selectedTextProperties);
    const { options, handleChange } = useAllowedCharacterStyles(frameConstraints);

    return (
        <ConstraintWrapper>
            <Icon icon={AvailableIcons.faFont} />
            <StudioDropdown
                id="character-style-constraint"
                dataId={'character-style-constraint'}
                selectedValue={options.find((option) => option.value === textStyle?.characterStyleId)}
                options={options}
                onChange={handleChange}
            />
        </ConstraintWrapper>
    );
};

export default CharacterStyleConstraint;
