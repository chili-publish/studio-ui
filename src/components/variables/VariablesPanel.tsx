import { useState } from 'react';
import { AvailableIcons, Button, ButtonVariant, FontSizes, Icon, Tray } from '@chili-publish/grafx-shared-components';
import { Variable } from '@chili-publish/studio-sdk';
import { css } from 'styled-components';
import VariablesList from './VariablesList';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { ContentType } from '../../contexts/VariablePanelContext.types';
import ImagePanel from '../imagePanel/ImagePanel';
import { EditButtonWrapper, VariablesPanelTitle } from './VariablesPanel.styles';

interface VariablesPanelProps {
    variables: Variable[];
    isDocumentLoaded: boolean;
}

const MEDIA_PANEL_TOOLBAR_HEIGHT_REM = '3rem';
const BREADCRUMBS_HEIGHT_REM = '3.5rem';

const imagePanelHeight = `
    calc(100%
        - ${MEDIA_PANEL_TOOLBAR_HEIGHT_REM}
        - ${BREADCRUMBS_HEIGHT_REM}
    )`;

function VariablesPanel(props: VariablesPanelProps) {
    const { variables, isDocumentLoaded } = props;
    const { contentType, showVariablesPanel, imagePanelTitle } = useVariablePanelContext();

    const [isVariablesPanelVisible, setIsVariablesPanelVisible] = useState<boolean>(false);
    const [mobileOptionsListOpen, setMobileOptionsListOpen] = useState(false);
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
                        font-size: ${FontSizes.regular};
                        border-radius: 50%;

                        svg {
                            width: 1.125rem !important;
                        }
                    `}
                />
            </EditButtonWrapper>
            <Tray
                isOpen={isVariablesPanelVisible}
                close={closeVariablePanel}
                title={showVariablesList ? <VariablesPanelTitle>Customize</VariablesPanelTitle> : imagePanelTitle}
                onTrayHidden={showVariablesPanel}
                styles={css`
                    height: ${contentType === ContentType.IMAGE_PANEL ? '100%' : 'auto'};
                    overflow: ${showVariablesList ? 'auto' : 'hidden'};
                `}
                hideCloseButton={mobileOptionsListOpen}
            >
                {showVariablesList ? (
                    <VariablesList
                        variables={variables}
                        onMobileOptionListToggle={(state) => setMobileOptionsListOpen(state)}
                        isDocumentLoaded={isDocumentLoaded}
                    />
                ) : (
                    <ImagePanel height={imagePanelHeight} />
                )}
            </Tray>
        </>
    );
}

export default VariablesPanel;
