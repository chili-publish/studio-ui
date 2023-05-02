import { AvailableIcons, Button, ButtonTypes, FontSizes, Icon, Tray } from '@chili-publish/grafx-shared-components';
import { useState } from 'react';
import { EditButtonWrapper } from './VariablesPanel.styles';

function VariablesPanel() {
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
                    <div style={{ display: 'flex' }}>TextF1:</div>
                    <div style={{ display: 'flex' }}>TextF2:</div>
                    <div style={{ display: 'flex' }}>TextF2:</div>
                    <div style={{ display: 'flex' }}>TextF1:</div>
                    <div style={{ display: 'flex' }}>TextF2:</div>
                </div>
            </Tray>
        </>
    );
}

export default VariablesPanel;
