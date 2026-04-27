import { AvailableIcons, Icon, InputLabel, LoadingIcon, SelectOptions } from '@chili-publish/grafx-shared-components';
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
    isLoading?: boolean;
    onOpen: () => void;
}
const StudioMobileDropdownControl = ({
    dataId,
    label,
    selectedValue,
    placeholder,
    validationError,
    required,
    isLoading,
    onOpen,
}: StudioMobileDropdownControlProps) => {
    return (
        <DropdownContainer
            data-id={dataId}
            data-testid={dataId}
            disabled={isLoading}
            onClick={!isLoading ? () => onOpen() : undefined}
        >
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
                {isLoading ? <LoadingIcon /> : <Icon icon={AvailableIcons.faChevronDown} />}
            </MobileDropdownOptionContainer>
            {validationError ? <ErrorMessage>{validationError}</ErrorMessage> : null}
        </DropdownContainer>
    );
};

export default StudioMobileDropdownControl;
