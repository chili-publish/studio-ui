import { useAppSelector } from 'src/store';
import { selectedTextProperties } from 'src/store/reducers/frameReducer';
import useAllowedCharacterStyles from '../../_shared/useAllowedCharacterStyles';
import StudioMobileDropdownOptions from 'src/components/shared/StudioMobileDropdown/StudioMobileDropdownOptions';
import { FrameConstraints } from '@chili-publish/studio-sdk';

const MobileCharacterStyleConstraint = ({ frameConstraints }: { frameConstraints: FrameConstraints | null }) => {
    const textStyle = useAppSelector(selectedTextProperties);
    const { options, handleChange } = useAllowedCharacterStyles(frameConstraints);
    return (
        <StudioMobileDropdownOptions
            options={options}
            selectedValue={options.find((option) => option.value === textStyle?.characterStyleId)}
            onChange={handleChange}
            onClose={() => null}
        />
    );
};

export default MobileCharacterStyleConstraint;
