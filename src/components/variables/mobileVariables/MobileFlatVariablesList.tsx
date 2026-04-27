import { InputLabel } from '@chili-publish/grafx-shared-components';
import { Variable, VariableType } from '@chili-publish/studio-sdk';
import { useSelector } from 'react-redux';
import { getDataIdForSUI, getDataTestIdForSUI } from 'src/utils/dataIds';
import MobileListVariable from '../../variablesComponents/listVariable/MobileListVariable';
import { isListVariable } from '../../variablesComponents/Variable';
import VariablesComponents from '../../variablesComponents/VariablesComponents';
import { HelpTextWrapper } from '../../variablesComponents/VariablesComponents.styles';
import { ComponentWrapper } from '../VariablesPanel.styles';
import {
    PanelType,
    selectActivePanel,
    showDatePickerPanel,
    showListVariablePanel,
} from '../../../store/reducers/panelReducer';
import { selectCurrentVariableId, selectVariablesValidation } from '../../../store/reducers/variableReducer';
import { useAppDispatch } from '../../../store';

interface MobileFlatVariablesListProps {
    variables: Variable[];
}
const MobileFlatVariablesList = ({ variables }: MobileFlatVariablesListProps) => {
    const dispatch = useAppDispatch();
    const variablesValidation = useSelector(selectVariablesValidation);

    const activePanel = useSelector(selectActivePanel);
    const currentVariableId = useSelector(selectCurrentVariableId);
    const isDataSourceVariablePanelOpen =
        activePanel === PanelType.DATA_SOURCE_VARIABLE_LIST_MODE ||
        activePanel === PanelType.DATA_SOURCE_VARIABLE_TABLE_MODE;
    return (
        <>
            {variables.map((variable: Variable) => {
                if (!variable.isVisible) return null;
                // initial refactoring of MobileTrayView which is too complex
                if (isDataSourceVariablePanelOpen && currentVariableId !== variable.id) return null;

                const errMsg = variablesValidation?.[variable.id]?.errorMsg;
                // custom list variable component for mobile view
                if (isListVariable(variable))
                    return (
                        <ComponentWrapper
                            key={`variable-component-${variable.id}`}
                            data-intercom-target={`dropdown-variable-${variable.name}`}
                            data-id={getDataIdForSUI(`variable-${variable.id}`)}
                            data-testid={getDataTestIdForSUI(`variable-${variable.id}`)}
                        >
                            <HelpTextWrapper>
                                <div>
                                    <MobileListVariable
                                        variable={variable}
                                        validationError={errMsg}
                                        onMenuOpen={() => dispatch(showListVariablePanel({ variableId: variable.id }))}
                                    />
                                </div>
                                {variable.helpText && !errMsg ? (
                                    <InputLabel labelFor={variable.id} label={variable.helpText} />
                                ) : null}
                            </HelpTextWrapper>
                        </ComponentWrapper>
                    );
                return (
                    <ComponentWrapper
                        key={`variable-component-${variable.id}`}
                        data-id={getDataIdForSUI(`variable-${variable.id}`)}
                        data-testid={getDataTestIdForSUI(`variable-${variable.id}`)}
                    >
                        <VariablesComponents
                            type={variable.type}
                            variable={variable}
                            onCalendarOpen={() => {
                                if (variable.type === VariableType.date)
                                    dispatch(showDatePickerPanel({ variableId: variable.id }));
                            }}
                        />
                    </ComponentWrapper>
                );
            })}
        </>
    );
};

export default MobileFlatVariablesList;
