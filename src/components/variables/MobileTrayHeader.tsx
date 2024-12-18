import { AvailableIcons, Button, ButtonVariant, Icon, useTheme } from '@chili-publish/grafx-shared-components';
import { css } from 'styled-components';
import { ContentType } from '../../contexts/VariablePanelContext.types';
import { DatePickerTrayTitle, TrayPanelTitle } from './VariablesPanel.styles';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';

interface MobileTrayHeaderProps {
    mobileListOpen: boolean;
    hasDataConnector: boolean;
}
function MobileTrayHeader({ mobileListOpen, hasDataConnector }: MobileTrayHeaderProps) {
    const { contentType, showVariablesPanel, imagePanelTitle } = useVariablePanelContext();
    const { panel, mode } = useTheme();

    if ((contentType === ContentType.VARIABLES_LIST && !hasDataConnector) || mobileListOpen)
        return <TrayPanelTitle panelTheme={panel}>Customize</TrayPanelTitle>;
    if (contentType === ContentType.DATE_VARIABLE_PICKER)
        return (
            <DatePickerTrayTitle themeMode={mode}>
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
                <TrayPanelTitle panelTheme={panel} margin="0">
                    Select date
                </TrayPanelTitle>
            </DatePickerTrayTitle>
        );

    if (contentType === ContentType.IMAGE_PANEL) return imagePanelTitle;
    if (contentType === ContentType.DATA_SOURCE_TABLE)
        return (
            <DatePickerTrayTitle themeMode={mode}>
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
                <TrayPanelTitle panelTheme={panel} margin="0">
                    Data source
                </TrayPanelTitle>
            </DatePickerTrayTitle>
        );
    if (hasDataConnector) return <TrayPanelTitle panelTheme={panel}>Data source</TrayPanelTitle>;
}

export default MobileTrayHeader;
