import { useState } from 'react';
import { AvailableIcons, Button, ButtonVariant, FontSizes, Icon, Tray } from '@chili-publish/grafx-shared-components';
import { Variable } from '@chili-publish/studio-sdk';
import { css } from 'styled-components';
import { EditButtonWrapper } from './VariablesPanel.styles';
import VariablesList from './VariablesList';
import { useTrayAndLeftPanelContext } from '../../contexts/TrayAndLeftPanelContext';
import { ContentType } from '../../contexts/TrayAndLeftPanelContext.types';
import ImagePanel from '../imagePanel/ImagePanel';

interface VariablesPanelProps {
    variables: Variable[];
}

function VariablesPanel(props: VariablesPanelProps) {
    const { variables } = props;
    const { contentType } = useTrayAndLeftPanelContext();

    const [isVariablesPanelVisible, setIsVariablesPanelVisible] = useState<boolean>(false);
    const closeVariablePanel = () => {
        setIsVariablesPanelVisible(false);
    };

    const showVariablesList = contentType === ContentType.VARIABLES_LIST;

    return (
        <>
            <EditButtonWrapper>
                <Button
                    variant={ButtonVariant.primary}
                    icon={<Icon key="icon-edit-variable" icon={AvailableIcons.faPen} height="1.125rem" />}
                    onClick={() => setIsVariablesPanelVisible(true)}
                    styles={css`
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
                title={showVariablesList ? 'Customize' : ''}
                styles={css`
                    height: ${contentType === ContentType.IMAGE_PANEL ? '100%' : 'auto'};
                `}
            >
                <div>{showVariablesList ? <VariablesList variables={variables} /> : <ImagePanel />}</div>
            </Tray>
        </>
    );
}

export default VariablesPanel;
