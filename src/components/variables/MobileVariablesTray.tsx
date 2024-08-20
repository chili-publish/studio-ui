import { useMemo, useState } from 'react';
import {
    AvailableIcons,
    Button,
    ButtonVariant,
    FontSizes,
    Icon,
    Tray,
    Colors,
} from '@chili-publish/grafx-shared-components';
import { Variable } from '@chili-publish/studio-sdk';
import { css } from 'styled-components';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { ContentType } from '../../contexts/VariablePanelContext.types';
import ImagePanel from '../imagePanel/ImagePanel';
import { DatePickerTrayTitle, EditButtonWrapper, VariablesPanelTitle, VariablesContainer } from './VariablesPanel.styles';
import MobileVariablesList from './MobileVariablesList';

interface VariablesPanelProps {
    variables: Variable[];
    isDocumentLoaded: boolean;
}

const MEDIA_PANEL_TOOLBAR_HEIGHT_REM = '3rem';

const imagePanelHeight = `
    calc(100%
        - ${MEDIA_PANEL_TOOLBAR_HEIGHT_REM}
    )`;

function MobileVariablesPanel(props: VariablesPanelProps) {
    const { variables, isDocumentLoaded } = props;
    const { contentType, showVariablesPanel, imagePanelTitle } = useVariablePanelContext();

    const [isVariablesPanelVisible, setIsVariablesPanelVisible] = useState<boolean>(false);
    const [mobileOptionsListOpen, setMobileOptionsListOpen] = useState(false);
    const closeVariablePanel = () => {
        setIsVariablesPanelVisible(false);
    };

    const showVariablesList = contentType === ContentType.VARIABLES_LIST;
    const showDateVariable = contentType === ContentType.DATE_VARIABLE_PICKER;
    const showImageBrowsePanel = contentType === ContentType.IMAGE_PANEL;

    const renderTrayHeader = useMemo(() => {
        if (showVariablesList) return <VariablesPanelTitle>Customize</VariablesPanelTitle>;
        if (showDateVariable)
            return (
                <DatePickerTrayTitle>
                    <Button
                        type="button"
                        variant={ButtonVariant.tertiary}
                        onClick={() => {
                            showVariablesPanel();
                        }}
                        icon={
                            <Icon
                                key="go-back-to-variable-list"
                                icon={AvailableIcons.faArrowLeft}
                                color={Colors.PRIMARY_FONT}
                            />
                        }
                        styles={css`
                            padding: 0 0.5rem 0 0;
                        `}
                    />
                    <VariablesPanelTitle margin="0">Select date</VariablesPanelTitle>
                </DatePickerTrayTitle>
            );

        return imagePanelTitle;
    }, [imagePanelTitle, showDateVariable, showVariablesList, showVariablesPanel]);

    const showImagePanel = !(showVariablesList || showDateVariable);

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
                title={renderTrayHeader}
                onTrayHidden={showVariablesPanel}
                hideCloseButton={mobileOptionsListOpen}
                styles={css`
                    height: ${contentType === ContentType.IMAGE_PANEL ? 'calc(100% - 4rem)' : 'auto'};
                    overflow: ${showVariablesList ? 'auto' : 'hidden'};
                    ${contentType === ContentType.IMAGE_PANEL && `padding-bottom: 0`};
                `}
            >
                <VariablesContainer height={showImagePanel ? imagePanelHeight : undefined}>
                    {!showImageBrowsePanel && (
                        <MobileVariablesList
                            variables={variables}
                            isDocumentLoaded={isDocumentLoaded}
                            onMobileOptionListToggle={setMobileOptionsListOpen}
                        />
                    )}
                    {showImageBrowsePanel && <ImagePanel />}
                </VariablesContainer>
            </Tray>
        </>
    );
}

export default MobileVariablesPanel;
