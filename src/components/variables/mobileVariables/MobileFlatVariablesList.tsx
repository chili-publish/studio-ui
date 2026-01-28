import { InputLabel } from '@chili-publish/grafx-shared-components';
import { Variable, VariableType } from '@chili-publish/studio-sdk';
import { useSelector } from 'react-redux';
import { getDataIdForSUI, getDataTestIdForSUI } from 'src/utils/dataIds';
import MobileListVariable from '../../variablesComponents/listVariable/MobileListVariable';
import { isListVariable } from '../../variablesComponents/Variable';
import VariablesComponents from '../../variablesComponents/VariablesComponents';
import { HelpTextWrapper } from '../../variablesComponents/VariablesComponents.styles';
import { ComponentWrapper } from '../VariablesPanel.styles';
import { showDatePickerPanel, showListVariablePanel } from '../../../store/reducers/panelReducer';
import { selectVariablesValidation } from '../../../store/reducers/variableReducer';
import { useAppDispatch } from '../../../store';

interface MobileFlatVariablesListProps {
    variables: Variable[];
}
function MobileFlatVariablesList({ variables }: MobileFlatVariablesListProps) {
    const dispatch = useAppDispatch();
    const variablesValidation = useSelector(selectVariablesValidation);

    return (
        <>
            {variables.map((variable: Variable) => {
                if (!variable.isVisible) return null;

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
}

export default MobileFlatVariablesList;
