import { Id, ParagraphStyle, SelectedTextStyles, TextStyleUpdateType } from '@chili-publish/studio-sdk';
import { useEffect, useState } from 'react';
import StudioDropdown from '../../shared/StudioDropdown';
import { getDataIdForSUI } from 'src/utils/dataIds';
import { useAppSelector } from 'src/store';
import { selectedTextProperties } from 'src/store/reducers/frameReducer';
import { AvailableIcons, Icon } from '@chili-publish/grafx-shared-components';
import { ConstraintWrapper } from '../InlineTextEditingToolbar.styles';

const ParagraphStyleConstraint = ({ paragraphStyleIds }: { paragraphStyleIds: Id[] }) => {
    const textStyle = useAppSelector(selectedTextProperties);
    const [selectedParagraphStyle, setSelectedParagraphStyle] = useState<ParagraphStyle[]>([]);

    useEffect(() => {
        if (paragraphStyleIds.length > 0) {
            const fetchParagraphStyles = async () => {
                const paragraphStylesData = await Promise.all(
                    paragraphStyleIds.map((id) => window.StudioUISDK.paragraphStyle.getById(id)),
                );
                setSelectedParagraphStyle(
                    paragraphStylesData.map((data) => data.parsedData).filter((data) => data !== null),
                );
            };
            fetchParagraphStyles();
        }
    }, [paragraphStyleIds]);

    const options = selectedParagraphStyle.map((style) => ({
        label: style.name,
        value: style.id,
    }));

    const handleChange = async (val: string) =>
        window.StudioUISDK.textSelection.set({ [SelectedTextStyles.PARAGRAPH]: { value: val } } as TextStyleUpdateType);

    return (
        <ConstraintWrapper>
            <Icon icon={AvailableIcons.faParagraph} />
            <StudioDropdown
                id="paragraph-style-constraint"
                dataId={getDataIdForSUI('paragraph-style-constraint')}
                selectedValue={options.find((option) => option.value === textStyle?.paragraphStyleId)}
                options={options}
                onChange={handleChange}
            />
        </ConstraintWrapper>
    );
};

export default ParagraphStyleConstraint;
