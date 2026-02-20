import { AvailableIcons, Icon, Input } from '@chili-publish/grafx-shared-components';
import { ConstraintWrapper } from '../InlineTextEditingToolbar.styles';
import { getDataIdForSUI, getDataTestIdForSUI } from 'src/utils/dataIds';
import { useAppSelector } from 'src/store';
import { selectedTextProperties } from 'src/store/reducers/frameReducer';
import { ChangeEvent } from 'react';
import { SelectedTextStyles, TextStyleUpdateType } from '@chili-publish/studio-sdk';

interface FontSizeConstraintProps {
    min?: number | null;
    max?: number | null;
}
const FontSizeConstraint = ({ min, max }: FontSizeConstraintProps) => {
    const textStyle = useAppSelector(selectedTextProperties);

    const handleChange = async (val: number) =>
        window.StudioUISDK.textSelection.set({ [SelectedTextStyles.FONT_SIZE]: { value: val } } as TextStyleUpdateType);

    return (
        <ConstraintWrapper>
            <Icon icon={AvailableIcons.faTextSize} />
            <Input
                type="number"
                name="font-size-constraint"
                min={min ?? undefined}
                max={max ?? undefined}
                value={`${textStyle?.fontSize}`}
                step={1}
                dataId={getDataIdForSUI(`font-size-constraint`)}
                dataTestId={getDataTestIdForSUI(`font-size-constraint`)}
                onBlur={(event: ChangeEvent<HTMLInputElement>) => {
                    const currentValue = parseFloat(event.target.value.replace(',', '.'));
                    handleChange(currentValue);
                }}
                onValueChange={(value: string) => {
                    const currentValue = parseFloat(value.replace(',', '.'));
                    handleChange(currentValue);
                }}
            />
        </ConstraintWrapper>
    );
};

export default FontSizeConstraint;
