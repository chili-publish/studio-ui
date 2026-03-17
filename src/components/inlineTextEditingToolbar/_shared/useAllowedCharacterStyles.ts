import { CharacterStyle, FrameConstraints, SelectedTextStyles, TextStyleUpdateType } from '@chili-publish/studio-sdk';
import { useEffect, useState } from 'react';

const useAllowedCharacterStyles = (frameConstraints: FrameConstraints | null) => {
    const [characterStyles, setCharacterStyles] = useState<CharacterStyle[]>([]);

    useEffect(() => {
        const characterStyleIds = frameConstraints?.text?.characterStyles.value.ids ?? [];
        if (characterStyleIds.length > 0) {
            const fetchCharacterStyles = async () => {
                const characterStylesData = await Promise.all(
                    characterStyleIds.map((id) => window.StudioUISDK.characterStyle.getById(id)),
                );
                setCharacterStyles(characterStylesData.map((data) => data.parsedData).filter((data) => data !== null));
            };
            fetchCharacterStyles();
        } else {
            setCharacterStyles([]);
        }
    }, [frameConstraints]);

    const options = characterStyles.map((style) => ({
        label: style.name,
        value: style.id,
    }));

    const handleChange = async (val: string) =>
        window.StudioUISDK.textSelection.set({ [SelectedTextStyles.CHARACTER]: { value: val } } as TextStyleUpdateType);

    return {
        options,
        handleChange,
    };
};

export default useAllowedCharacterStyles;
