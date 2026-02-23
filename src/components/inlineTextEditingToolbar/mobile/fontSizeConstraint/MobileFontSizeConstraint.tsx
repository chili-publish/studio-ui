import { Input } from '@chili-publish/grafx-shared-components';
import { FrameConstraints, SelectedTextStyles, TextStyleUpdateType } from '@chili-publish/studio-sdk';
import { ChangeEvent } from 'react';
import { useAppSelector } from 'src/store';
import { selectedTextProperties } from 'src/store/reducers/frameReducer';
import { getDataIdForSUI, getDataTestIdForSUI } from 'src/utils/dataIds';

const MobileFontSizeConstraint = ({ frameConstraints }: { frameConstraints: FrameConstraints | null }) => {
    const textStyle = useAppSelector(selectedTextProperties);
    const handleChange = async (val: number) =>
        window.StudioUISDK.textSelection.set({ [SelectedTextStyles.FONT_SIZE]: { value: val } } as TextStyleUpdateType);

    return (
        <Input
            type="number"
            name="mobile-font-size-constraint"
            label="Font Size"
            min={frameConstraints?.text?.fontSizes.value.min ?? undefined}
            max={frameConstraints?.text?.fontSizes.value.max ?? undefined}
            value={`${textStyle?.fontSize}`}
            step={1}
            dataId={getDataIdForSUI(`mobile-font-size-constraint`)}
            dataTestId={getDataTestIdForSUI(`mobile-font-size-constraint`)}
            onBlur={(event: ChangeEvent<HTMLInputElement>) => {
                const currentValue = parseFloat(event.target.value.replace(',', '.'));
                handleChange(currentValue);
            }}
            onValueChange={(value: string) => {
                const currentValue = parseFloat(value.replace(',', '.'));
                handleChange(currentValue);
            }}
        />
    );
};

export default MobileFontSizeConstraint;
