import StudioMobileDropdownOptions from 'src/components/shared/StudioMobileDropdown/StudioMobileDropdownOptions';
import useAllowedParagraphStyles from '../../_shared/useAllowedParagraphStyles';
import { FrameConstraints } from '@chili-publish/studio-sdk';
import { useAppSelector } from 'src/store';
import { selectedTextProperties } from 'src/store/reducers/frameReducer';

const MobileParagraphStyleConstraint = ({ frameConstraints }: { frameConstraints: FrameConstraints | null }) => {
    const textStyle = useAppSelector(selectedTextProperties);
    const { options, handleChange } = useAllowedParagraphStyles(frameConstraints);
    return (
        <StudioMobileDropdownOptions
            options={options}
            selectedValue={options.find((option) => option.value === textStyle?.paragraphStyleId)}
            onChange={handleChange}
            onClose={() => null}
        />
    );
};

export default MobileParagraphStyleConstraint;
