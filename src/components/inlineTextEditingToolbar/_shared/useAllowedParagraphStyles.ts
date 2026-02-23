import { FrameConstraints, ParagraphStyle, SelectedTextStyles, TextStyleUpdateType } from '@chili-publish/studio-sdk';
import { useEffect, useState } from 'react';

const useAllowedParagraphStyles = (frameConstraints: FrameConstraints | null) => {
    const [selectedParagraphStyle, setSelectedParagraphStyle] = useState<ParagraphStyle[]>([]);

    useEffect(() => {
        const paragraphStyleIds = frameConstraints?.text?.paragraphStyles.value.ids ?? [];
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
    }, [frameConstraints]);

    const options = selectedParagraphStyle.map((style) => ({
        label: style.name,
        value: style.id,
    }));

    const handleChange = async (val: string) =>
        window.StudioUISDK.textSelection.set({ [SelectedTextStyles.PARAGRAPH]: { value: val } } as TextStyleUpdateType);

    return {
        options,
        handleChange,
    };
};

export default useAllowedParagraphStyles;
