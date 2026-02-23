import { useAppSelector } from 'src/store';
import { selectedTextProperties } from 'src/store/reducers/frameReducer';
import useFrameConstraints from './useFrameConstraints';

const useTextEditingEnabled = () => {
    const { frameConstraints } = useFrameConstraints();
    const textProperties = useAppSelector(selectedTextProperties);

    const hasParagraphStyleConstraint = frameConstraints?.text?.paragraphStyles?.value.allowed;
    const hasCharacterStyleConstraint = frameConstraints?.text?.characterStyles?.value.allowed;
    const hasFontSizeConstraint = frameConstraints?.text?.fontSizes?.value.allowed;
    const hasColorConstraint = frameConstraints?.text?.colors?.value.allowed;
    const hasTextEditingAllowed = frameConstraints?.text?.editingAllowed.value;

    return {
        frameConstraints,
        textInEditMode: !!textProperties,
        hasParagraphStyleConstraint,
        hasCharacterStyleConstraint,
        hasFontSizeConstraint,
        hasColorConstraint,
        hasTextEditingAllowed,
    };
};

export default useTextEditingEnabled;
