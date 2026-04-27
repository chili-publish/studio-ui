import { DataSourceVariable } from '@chili-publish/studio-sdk';
import StudioMobileDropdownControl from 'src/components/shared/StudioMobileDropdown/StudioMobileDropdownControl';
import { useUiConfigContext } from 'src/contexts/UiConfigContext';
import { showDataSourceVariableListModePanel } from '../../../../store/reducers/panelReducer';
import { getDataIdForSUI } from 'src/utils/dataIds';
import { useAppDispatch } from 'src/store';
import { getVariablePlaceholder } from '../../variablePlaceholder.util';
import { HelpTextWrapper } from '../../VariablesComponents.styles';
import { InputLabel } from '@chili-publish/grafx-shared-components';

interface IMobileDataSourceListMode {
    selectedValue: { value: string; label: string } | null;

    variable: DataSourceVariable;
    validationError: string | undefined;

    isLoading: boolean;

    onVariableFocus?: (variableId: string) => void;
}
const MobileDataSourceListModeControl = (props: IMobileDataSourceListMode) => {
    const dispatch = useAppDispatch();

    const { variable, selectedValue, validationError, isLoading } = props;
    const { onVariableFocus } = useUiConfigContext();
    const placeholder = getVariablePlaceholder(variable);

    const handleOpen = () => {
        dispatch(showDataSourceVariableListModePanel({ variableId: variable.id }));
    };
    return (
        <HelpTextWrapper>
            <StudioMobileDropdownControl
                isLoading={isLoading}
                dataId={getDataIdForSUI(`data-source-variable-list-${variable.id}`)}
                selectedValue={selectedValue}
                label={variable.label ?? variable.name}
                placeholder={placeholder}
                onOpen={() => {
                    handleOpen();
                    onVariableFocus?.(variable.id);
                }}
            />
            {variable.helpText && !validationError ? (
                <InputLabel labelFor={variable.id} label={variable.helpText} />
            ) : null}
        </HelpTextWrapper>
    );
};

export default MobileDataSourceListModeControl;
