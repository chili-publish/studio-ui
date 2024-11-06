import { ContentType } from '../../contexts/VariablePanelContext.types';
import { DatePickerTrayTitle, VariablesPanelTitle } from './VariablesPanel.styles';
import { AvailableIcons, Button, ButtonVariant, Icon, useTheme } from '@chili-publish/grafx-shared-components';
import { css } from 'styled-components';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';

const MobileTrayHeader = () => {
    const { contentType, showVariablesPanel, imagePanelTitle } = useVariablePanelContext();
    const { panel, mode } = useTheme();

    if (contentType === ContentType.DATA_SOURCE_TABLE) return <>Data source</>;
    if (contentType === ContentType.VARIABLES_LIST)
        return <VariablesPanelTitle panelTheme={panel}>Customize</VariablesPanelTitle>;
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
                <VariablesPanelTitle panelTheme={panel} margin="0">
                    Select date
                </VariablesPanelTitle>
            </DatePickerTrayTitle>
        );

    return imagePanelTitle;
};

export default MobileTrayHeader;
