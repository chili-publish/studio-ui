import { AvailableIcons, Button, ButtonVariant, FontSizes, Icon } from '@chili-publish/grafx-shared-components';
import { css } from 'styled-components';
import { useMemo, useState } from 'react';
import { Layout, LayoutListItemType, LayoutPropertiesType, PageSize, Variable } from '@chili-publish/studio-sdk';
import { EditButtonWrapper } from './VariablesPanel.styles';
import { getDataTestIdForSUI } from '../../utils/dataIds';
import { UiOptions } from '../../types/types';
import MobileVariablesPanel from './MobileVariablesTray';
import { useUserInterfaceDetailsContext } from '../navbar/UserInterfaceDetailsContext';

interface MobileVariablesProps {
    variables: Variable[];
    selectedLayout: Layout | null;
    layouts: LayoutListItemType[];
    layoutPropertiesState: LayoutPropertiesType;
    pageSize?: PageSize;
    layoutSectionUIOptions: UiOptions['layoutSection'] & { visible: boolean };

    isTimelineDisplayed?: boolean;
    isPagesPanelDisplayed?: boolean;
}

function MobileVariables(props: MobileVariablesProps) {
    const [isTrayVisible, setIsTrayVisible] = useState<boolean>(false);
    const { formBuilder, validFormBuilder } = useUserInterfaceDetailsContext();
    const { isTimelineDisplayed, isPagesPanelDisplayed, ...trayProps } = props;
    const shouldHideEditButton = useMemo(
        () =>
            validFormBuilder &&
            [formBuilder.variables.active, formBuilder.datasource.active, formBuilder.layouts.active].every((v) => !v),
        [validFormBuilder, formBuilder.variables.active, formBuilder.datasource.active, formBuilder.layouts.active],
    );
    return (
        <>
            {!shouldHideEditButton && (
                <EditButtonWrapper
                    isTimelineDisplayed={isTimelineDisplayed}
                    isPagesPanelDisplayed={isPagesPanelDisplayed}
                >
                    <Button
                        dataTestId={getDataTestIdForSUI('mobile-variables')}
                        variant={ButtonVariant.primary}
                        icon={<Icon key="icon-edit-variable" icon={AvailableIcons.faPen} height="1.125rem" />}
                        onClick={() => setIsTrayVisible(true)}
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
            )}
            {isTrayVisible ? (
                <MobileVariablesPanel
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...trayProps}
                    isTrayVisible={isTrayVisible}
                    setIsTrayVisible={setIsTrayVisible}
                />
            ) : null}
        </>
    );
}

export default MobileVariables;
