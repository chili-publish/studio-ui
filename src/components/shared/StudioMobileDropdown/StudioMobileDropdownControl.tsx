import { AvailableIcons, Icon, InputLabel, SelectOptions } from '@chili-publish/grafx-shared-components';
import {
    DropdownContainer,
    MobileDropdownOptionContainer,
    MobileDropdownValue,
    MobilePlaceholderWrapper,
} from './StudioMobileDropdown.styles';
import { ErrorMessage } from '../ErrorMessage.styles';

interface StudioMobileDropdownControlProps {
    dataId: string;
    label?: string;
    selectedValue?: SelectOptions | null;
    placeholder?: string;
    validationError?: string;
    required?: boolean;
    onOpen: () => void;
}
const StudioMobileDropdownControl = ({
    dataId,
    label,
    selectedValue,
    placeholder,
    validationError,
    required,
    onOpen,
}: StudioMobileDropdownControlProps) => {
    return (
        <DropdownContainer data-id={dataId} data-testid={dataId} onClick={onOpen}>
            {label ? <InputLabel labelFor={label} label={label} required={required} /> : null}
            <MobileDropdownOptionContainer hasError={!!validationError}>
                <MobileDropdownValue>
                    {selectedValue?.label ? (
                        // eslint-disable-next-line react/jsx-no-useless-fragment
                        <>{selectedValue.label}</>
                    ) : (
                        <MobilePlaceholderWrapper>{placeholder ?? 'Select...'}</MobilePlaceholderWrapper>
                    )}
                </MobileDropdownValue>
                <Icon icon={AvailableIcons.faChevronDown} />
            </MobileDropdownOptionContainer>
            {validationError ? <ErrorMessage>{validationError}</ErrorMessage> : null}
        </DropdownContainer>
    );
};

export default StudioMobileDropdownControl;
