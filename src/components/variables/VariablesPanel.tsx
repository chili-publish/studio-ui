import { useState } from 'react';
import { AvailableIcons, Button, ButtonVariant, FontSizes, Icon, Tray } from '@chili-publish/grafx-shared-components';
import { Variable } from '@chili-publish/studio-sdk';
import { css } from 'styled-components';
import { Colors } from '@chili-publish/grafx-shared-components/lib';
import { EditButtonWrapper } from './VariablesPanel.styles';
import VariableComponent from '../variablesComponents/VariablesComponents';

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
                title={
                    <h2 style={{ fontSize: '18px', fontWeight: 500, color: Colors.LIGHT_PRIMARY_WHITE }}>Customize</h2>
                }
            >
                <div style={{ marginTop: '8px' }}>
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
