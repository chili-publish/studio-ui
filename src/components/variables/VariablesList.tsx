import { useEffect, useState } from 'react';
import { ListVariable, Variable, VariableType } from '@chili-publish/studio-sdk';
import { useMobileSize } from '@chili-publish/grafx-shared-components';
import VariablesComponents from '../variablesComponents/VariablesComponents';
import { ComponentWrapper, VariablesListWrapper, VariablesPanelTitle } from './VariablesPanel.styles';
import StudioDropdown from '../shared/StudioDropdown';

interface VariablesListProps {
    variables: Variable[];
    onMobileOptionListToggle?: (_: boolean) => void;
    isDocumentLoaded: boolean;
}

const isListVariable = (variable: Variable): variable is ListVariable => variable.type === VariableType.list;

function VariablesList({ variables, onMobileOptionListToggle, isDocumentLoaded }: VariablesListProps) {
    const isMobileSize = useMobileSize();
    const [listVariableOpen, setListVariableOpen] = useState<ListVariable | null>(null);

    const updateListVariableValue = async (variableId: string, value: string) => {
        await window.SDK.variable.setValue(variableId, value);
    };

    useEffect(() => {
        if (onMobileOptionListToggle) onMobileOptionListToggle(!!listVariableOpen);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listVariableOpen]);

    return (
        <VariablesListWrapper optionsListOpen={!!listVariableOpen}>
            {!isMobileSize && <VariablesPanelTitle>Customize</VariablesPanelTitle>}
            {variables.length > 0 &&
                variables.map((variable: Variable) => {
                    if (!variable.isVisible) return null;

                    const isListVariabledDisplayed =
                        !listVariableOpen || (listVariableOpen && variable.id === listVariableOpen.id);
                    if (isListVariable(variable) && isListVariabledDisplayed) {
                        const variableItem = listVariableOpen || variable;
                        const options = variableItem.items.map((item) => ({ label: item, value: item }));
                        const selectedValue = variableItem.selected
                            ? { label: variableItem.selected, value: variableItem.selected }
                            : undefined;
                        return (
                            <ComponentWrapper key={`variable-component-${variable.id}`}>
                                <StudioDropdown
                                    label={variable.name}
                                    selectedValue={selectedValue}
                                    options={options}
                                    onChange={(val) => updateListVariableValue(variable.id, val)}
                                    onMenuOpen={() => setListVariableOpen(variable)}
                                    onMenuClose={() => setListVariableOpen(null)}
                                />
                            </ComponentWrapper>
                        );
                    }
                    return !listVariableOpen ? (
                        <ComponentWrapper key={`variable-component-${variable.id}`}>
                            <VariablesComponents
                                type={variable.type}
                                variable={variable}
                                isDocumentLoaded={isDocumentLoaded}
                            />
                        </ComponentWrapper>
                    ) : null;
                })}
        </VariablesListWrapper>
    );
}

export default VariablesList;
