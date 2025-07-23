import { AvailableIcons, Button, ButtonVariant, FontSizes, Icon } from '@chili-publish/grafx-shared-components';
import { css } from 'styled-components';
import { useState } from 'react';
import { Layout, LayoutListItemType, LayoutPropertiesType, PageSize } from '@chili-publish/studio-sdk';
import { useLeftPanelAndTrayVisibility } from '../../core/hooks/useLeftPanelAndTrayVisibility';
import { EditButtonWrapper } from './VariablesPanel.styles';
import { getDataTestIdForSUI } from '../../utils/dataIds';
import { UiOptions } from '../../types/types';
import MobileVariablesPanel from './MobileVariablesTray';

interface MobileVariablesProps {
    selectedLayout: Layout | null;
    layouts: LayoutListItemType[];
    layoutPropertiesState: LayoutPropertiesType;
    pageSize?: PageSize;
    layoutSectionUIOptions: UiOptions['layoutSection'] & { visible: boolean };

    isTimelineDisplayed?: boolean;
    isPagesPanelDisplayed?: boolean;
}

function MobileVariables(props: MobileVariablesProps) {
    const {
        isTimelineDisplayed,
        isPagesPanelDisplayed,
        layouts,
        selectedLayout,
        layoutSectionUIOptions,
        ...trayProps
    } = props;
    const [isTrayVisible, setIsTrayVisible] = useState<boolean>(false);
    const { shouldHide: shouldHideEditButton } = useLeftPanelAndTrayVisibility({
        layouts,
        selectedLayout,
        layoutSectionUIOptions,
    });

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
                    layouts={layouts}
                    selectedLayout={selectedLayout}
                    layoutSectionUIOptions={layoutSectionUIOptions}
                />
            ) : null}
        </>
    );
}

export default MobileVariables;
