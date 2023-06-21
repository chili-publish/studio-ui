import { useState } from 'react';
import { AvailableIcons, Button, ButtonVariant, FontSizes, Icon, Tray } from '@chili-publish/grafx-shared-components';
import { ListVariable, Variable, VariableType } from '@chili-publish/studio-sdk';
import { css } from 'styled-components';
import { ComponentWrapper, EditButtonWrapper, VariablesPanelTitle } from './VariablesPanel.styles';
import VariableComponent from '../variablesComponents/VariablesComponents';
import StudioDropdown from '../shared/StudioDropdown';

const isListVariable = (variable: Variable): variable is ListVariable => variable.type === VariableType.list;

function VariablesPanel(props: { variables: Variable[] }) {
    const { variables } = props;

    const [isVariablesPanelVisible, setIsVariablesPanelVisible] = useState<boolean>(false);
    const [listVariableOpen, setListVariableOpen] = useState<ListVariable | null>(null);
    const closeVariablePanel = () => {
        setIsVariablesPanelVisible(false);
    };

    const updateListVariableValue = async (value: string) => {
        if (!listVariableOpen) return;
        await window.SDK.variable.setVariableValue(listVariableOpen?.id, value);
    };

    return (
        <>
            <EditButtonWrapper>
                <Button
                    variant={ButtonVariant.primary}
                    icon={<Icon key="icon-edit-variable" icon={AvailableIcons.faPen} height="1.125rem" />}
                    onClick={() => setIsVariablesPanelVisible(true)}
                    styles={css`
                        border-radius: 3rem;
                        padding: 0.9375rem;
                        fontsize: ${FontSizes.regular};

                        svg {
                            width: 1.125rem !important;
                        }
                    `}
                />
            </EditButtonWrapper>
            <Tray
                isOpen={isVariablesPanelVisible}
                close={closeVariablePanel}
                title={<VariablesPanelTitle>Customize</VariablesPanelTitle>}
            >
                <div style={{ marginTop: '8px' }}>
                    {listVariableOpen ? (
                        <StudioDropdown
                            label={listVariableOpen.name}
                            selectedValue={
                                listVariableOpen.selected
                                    ? { label: listVariableOpen.selected, value: listVariableOpen.selected }
                                    : undefined
                            }
                            options={listVariableOpen.items.map((item) => ({ label: item, value: item }))}
                            onChange={(val) => updateListVariableValue(val)}
                            onMenuClose={() => setListVariableOpen(null)}
                        />
                    ) : (
                        variables.length > 0 &&
                        variables.map((variable: Variable) => {
                            if (isListVariable(variable)) {
                                const options = variable.items.map((item) => ({ label: item, value: item }));
                                const selectedValue = variable.selected
                                    ? { label: variable.selected, value: variable.selected }
                                    : undefined;
                                return (
                                    <ComponentWrapper key={`variable-component-${variable.id}`}>
                                        <StudioDropdown
                                            label={variable.name}
                                            selectedValue={selectedValue}
                                            options={options}
                                            onMenuOpen={() => setListVariableOpen(variable)}
                                        />
                                    </ComponentWrapper>
                                );
                            }
                            return (
                                <ComponentWrapper key={`variable-component-${variable.id}`}>
                                    <VariableComponent type={variable.type} variable={variable} />
                                </ComponentWrapper>
                            );
                        })
                    )}
                </div>
            </Tray>
        </>
    );
}

export default VariablesPanel;
