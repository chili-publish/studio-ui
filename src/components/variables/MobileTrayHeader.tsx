import { AvailableIcons, Button, ButtonVariant, Icon } from '@chili-publish/grafx-shared-components';
import { css } from 'styled-components';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { ContentType } from '../../contexts/VariablePanelContext.types';
import { DatePickerTrayTitle, TrayPanelTitle } from './VariablesPanel.styles';
import { SectionHelpText, SectionWrapper } from '../shared/Panel.styles';

interface MobileTrayHeaderProps {
    layoutSectionTitle: string;
    layoutSectionHelpText?: string;
    datasourceSectionTitle: string;
    datasourceSectionHelpText?: string;
    variablesSectionTitle: string;
    variablesSectionHelpText?: string;
    isDefaultPanelView: boolean;
    mobileListOpen: boolean;
    isDataSourceDisplayed: boolean;
    isAvailableLayoutsDisplayed: boolean;
}
function MobileTrayHeader({
    layoutSectionTitle,
    layoutSectionHelpText,
    datasourceSectionTitle,
    datasourceSectionHelpText,
    variablesSectionTitle,
    variablesSectionHelpText,
    isDefaultPanelView,
    mobileListOpen,
    isDataSourceDisplayed,
    isAvailableLayoutsDisplayed,
}: MobileTrayHeaderProps) {
    const { contentType, showVariablesPanel, imagePanelTitle } = useVariablePanelContext();

    if (isDefaultPanelView && isDataSourceDisplayed)
        return (
            <SectionWrapper id="datasource-section-header">
                <TrayPanelTitle margin="0">{datasourceSectionTitle}</TrayPanelTitle>
                {datasourceSectionHelpText && <SectionHelpText>{datasourceSectionHelpText}</SectionHelpText>}
            </SectionWrapper>
        );
    if (isDefaultPanelView && isAvailableLayoutsDisplayed)
        return (
            <SectionWrapper id="layout-section-header">
                <TrayPanelTitle margin="0">{layoutSectionTitle}</TrayPanelTitle>
                {layoutSectionHelpText && <SectionHelpText>{layoutSectionHelpText}</SectionHelpText>}
            </SectionWrapper>
        );
    if (contentType === ContentType.DEFAULT || mobileListOpen)
        return (
            <SectionWrapper id="layout-section-header">
                <TrayPanelTitle margin="0">{variablesSectionTitle}</TrayPanelTitle>
                {variablesSectionHelpText && <SectionHelpText>{variablesSectionHelpText}</SectionHelpText>}
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
                <TrayPanelTitle margin="0">{datasourceSectionTitle}</TrayPanelTitle>
            </DatePickerTrayTitle>
        );
}

export default MobileTrayHeader;
