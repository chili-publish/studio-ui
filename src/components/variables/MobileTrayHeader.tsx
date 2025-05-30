import { AvailableIcons, Button, ButtonVariant, Icon } from '@chili-publish/grafx-shared-components';
import { css } from 'styled-components';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { ContentType } from '../../contexts/VariablePanelContext.types';
import { MobileTrayFormBuilderHeader } from '../../types/types';
import { DatePickerTrayTitle, TrayPanelTitle } from './VariablesPanel.styles';
import { SectionHelpText, SectionWrapper } from '../shared/Panel.styles';

interface MobileTrayHeaderProps {
    isDefaultPanelView: boolean;
    mobileListOpen: boolean;
    isDataSourceDisplayed: boolean;
    isAvailableLayoutsDisplayed: boolean;
    trayHeaderData: MobileTrayFormBuilderHeader;
}
function MobileTrayHeader({
    isDefaultPanelView,
    mobileListOpen,
    isDataSourceDisplayed,
    isAvailableLayoutsDisplayed,
    trayHeaderData,
}: MobileTrayHeaderProps) {
    const { contentType, showVariablesPanel, imagePanelTitle } = useVariablePanelContext();

    const { datasource, variables, layouts } = trayHeaderData;

    if (isDefaultPanelView && isDataSourceDisplayed)
        return (
            <SectionWrapper id="datasource-section-header">
                <TrayPanelTitle margin="0">{datasource.title}</TrayPanelTitle>
                {datasource.helpText && <SectionHelpText>{datasource.helpText}</SectionHelpText>}
            </SectionWrapper>
        );
    if (isDefaultPanelView && isAvailableLayoutsDisplayed)
        return (
            <SectionWrapper id="layout-section-header">
                <TrayPanelTitle margin="0">{layouts.title}</TrayPanelTitle>
                {layouts.helpText && <SectionHelpText>{layouts.helpText}</SectionHelpText>}
            </SectionWrapper>
        );
    if (contentType === ContentType.DEFAULT || mobileListOpen)
        return (
            <SectionWrapper id="layout-section-header">
                <TrayPanelTitle margin="0">{variables.title}</TrayPanelTitle>
                {variables.helpText && <SectionHelpText>{variables.helpText}</SectionHelpText>}
            </SectionWrapper>
        );
    if (contentType === ContentType.DATE_VARIABLE_PICKER)
        return (
            <DatePickerTrayTitle>
                <Button
                    type="button"
                    variant={ButtonVariant.tertiary}
                    onClick={() => {
                        showVariablesPanel();
                    }}
                    icon={<Icon key="go-back-to-variable-list" icon={AvailableIcons.faArrowLeft} />}
                    styles={css`
                        padding: 0 0.5rem 0 0;
                    `}
                />
                <TrayPanelTitle margin="0">Select date</TrayPanelTitle>
            </DatePickerTrayTitle>
        );

    if (contentType === ContentType.IMAGE_PANEL) return imagePanelTitle;
    if (contentType === ContentType.DATA_SOURCE_TABLE)
        return (
            <DatePickerTrayTitle>
                <Button
                    type="button"
                    variant={ButtonVariant.tertiary}
                    onClick={() => {
                        showVariablesPanel();
                    }}
                    icon={<Icon key="go-back-to-variable-list" icon={AvailableIcons.faArrowLeft} />}
                    styles={css`
                        padding: 0 0.5rem 0 0;
                    `}
                />
                <TrayPanelTitle margin="0">{datasource.title}</TrayPanelTitle>
            </DatePickerTrayTitle>
        );
}

export default MobileTrayHeader;
