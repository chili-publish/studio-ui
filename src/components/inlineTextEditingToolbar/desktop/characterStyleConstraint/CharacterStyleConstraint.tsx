import { CharacterStyle, Id, SelectedTextStyles, TextStyleUpdateType } from '@chili-publish/studio-sdk';
import { useEffect, useState } from 'react';
import { useAppSelector } from 'src/store';
import { selectedTextProperties } from 'src/store/reducers/frameReducer';
import { ConstraintWrapper } from '../InlineTextEditingToolbar.styles';
import { AvailableIcons, Icon } from '@chili-publish/grafx-shared-components';
import StudioDropdown from '../../../shared/StudioDropdown';

const CharacterStyleConstraint = ({ characterStyleIds }: { characterStyleIds: Id[] }) => {
    const textStyle = useAppSelector(selectedTextProperties);
    const [characterStyles, setCharacterStyles] = useState<CharacterStyle[]>([]);

    useEffect(() => {
        if (characterStyleIds.length > 0) {
            const fetchCharacterStyles = async () => {
                const characterStylesData = await Promise.all(
                    characterStyleIds.map((id) => window.StudioUISDK.characterStyle.getById(id)),
                );
                setCharacterStyles(characterStylesData.map((data) => data.parsedData).filter((data) => data !== null));
            };
            fetchCharacterStyles();
        }
    }, [characterStyleIds]);

    const options = characterStyles.map((style) => ({
        label: style.name,
        value: style.id,
    }));

    const handleChange = async (val: string) =>
        window.StudioUISDK.textSelection.set({ [SelectedTextStyles.CHARACTER]: { value: val } } as TextStyleUpdateType);

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
