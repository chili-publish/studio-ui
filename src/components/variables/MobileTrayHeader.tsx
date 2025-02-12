import { AvailableIcons, Button, ButtonVariant, Icon } from '@chili-publish/grafx-shared-components';
import { css } from 'styled-components';
import { ContentType } from '../../contexts/VariablePanelContext.types';
import { DatePickerTrayTitle, TrayPanelTitle } from './VariablesPanel.styles';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';

interface MobileTrayHeaderProps {
    isDefaultPanelView: boolean;
    mobileListOpen: boolean;
    isDataSourceDisplayed: boolean;
    isAvailableLayoutsDisplayed: boolean;
}
function MobileTrayHeader({
    isDefaultPanelView,
    mobileListOpen,
    isDataSourceDisplayed,
    isAvailableLayoutsDisplayed,
}: MobileTrayHeaderProps) {
    const { contentType, showVariablesPanel, imagePanelTitle } = useVariablePanelContext();

    if (isDefaultPanelView && isDataSourceDisplayed) return <TrayPanelTitle>Data source</TrayPanelTitle>;
    if (isDefaultPanelView && isAvailableLayoutsDisplayed) return <TrayPanelTitle>Layout</TrayPanelTitle>;

    if (contentType === ContentType.DEFAULT || mobileListOpen) return <TrayPanelTitle>Customize</TrayPanelTitle>;
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
                <TrayPanelTitle margin="0">Data source</TrayPanelTitle>
            </DatePickerTrayTitle>
        );
}

export default MobileTrayHeader;
