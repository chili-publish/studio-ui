import { useState } from 'react';
import { AvailableIcons, Button, ButtonTypes, FontSizes, Icon, Tray } from '@chili-publish/grafx-shared-components';
import { Variable } from '@chili-publish/editor-sdk';
import { EditButtonWrapper } from './VariablesPanel.styles';
import VariableComponent from '../variableComponent/VariableComponent';

function VariablesPanel(props: { variables: Variable[] }) {
    const { variables } = props;

    const [isVariablesPanelVisible, setIsVariablesPanelVisible] = useState<boolean>(false);
    const closeVariablePanel = () => {
        setIsVariablesPanelVisible(false);
    };

    return (
        <>
            <EditButtonWrapper>
                <Button
                    buttonType={ButtonTypes.primary}
                    type="button"
                    icon={<Icon key="icon-edit-variable" icon={AvailableIcons.faPen} height="1.125rem" />}
                    onClick={() => setIsVariablesPanelVisible(true)}
                    style={{ borderRadius: '3rem', padding: '0.9375rem', fontSize: FontSizes.button }}
                />
            </EditButtonWrapper>
            <Tray isOpen={isVariablesPanelVisible} close={closeVariablePanel} title="Customize">
                <div style={{ marginTop: '30px' }}>
                    {variables.length > 0 &&
                        variables.map((variable: Variable) => {
                            return (
                                <VariableComponent
                                    key={`variable-component-${variable.id}`}
                                    type={variable.type}
                                    variable={variable}
                                />
                            );
                        })}
                </div>
            </Tray>
        </>
    );
}

export default VariablesPanel;
