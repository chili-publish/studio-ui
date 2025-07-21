import {
    PreviewCard,
    PreviewCardVariant,
    PreviewType,
    ScrollbarWrapper,
    useMobileSize,
} from '@chili-publish/grafx-shared-components';
import { Layout, LayoutListItemType, Page } from '@chili-publish/studio-sdk';
import { useLeftPanelAndTrayVisibility } from 'src/core/hooks/useLeftPanelAndTrayVisibility';
import { useUiConfigContext } from '../../contexts/UiConfigContext';
import { UiOptions } from '../../types/types';
import { BORDER_SIZE, PAGES_CONTAINER_HEIGHT, PREVIEW_FALLBACK } from '../../utils/constants';
import { Card, Container, ScrollableContainer } from './Pages.styles';
import { PreviewCardBadge } from './PreviewCardBadge';
import { useAttachArrowKeysListener } from './useAttachArrowKeysListener';
import { usePageSnapshots } from './usePageSnapshots';

interface PagesProps {
    pages: Page[];
    activePageId: string | null;
    layoutDetails: {
        layouts: LayoutListItemType[];
        selectedLayout: Layout | null;
        layoutSectionUIOptions: UiOptions['layoutSection'] & { visible: boolean };
    };
}

function Pages({ pages, activePageId, layoutDetails }: PagesProps) {
    const { uiOptions } = useUiConfigContext();
    const { shouldHide: leftPanelIsHidden } = useLeftPanelAndTrayVisibility(layoutDetails);

    const isMobileSize = useMobileSize();

    // Use the new page snapshots hook
    const { pageSnapshots } = usePageSnapshots(pages);

    /**
     * by attaching listeners here and not in ShortcutProvider.tsx,
     * 'pages' prop that gets populated via 'onPagesChanged' subscriber,
     * will not trigger rerenders of ShortcutProvider's children,
     * causing multiple query refectch in useMediaDetails
     */
    const { handleSelectPage } = useAttachArrowKeysListener({ pages, activePageId });

    if (uiOptions.widgets?.bottomBar?.visible === false) return null;

    return (
        <Container isMobileSize={isMobileSize} leftPanelIsVisible={!leftPanelIsHidden}>
            <ScrollbarWrapper
                height={`calc(${PAGES_CONTAINER_HEIGHT} - ${BORDER_SIZE})`}
                enableOverflowX
                enableOverflowY={false}
                scrollbarHeight={!isMobileSize ? '0.875rem' : '0'}
            >
                <ScrollableContainer isMobileSize={isMobileSize}>
                    {pages.length > 0 &&
                        pages.map((item, index) => (
                            <PreviewCardBadge badgeNumber={index + 1} key={`badge-${item.id}`}>
                                <Card selected={item.id === activePageId} key={`card-${item.id}`}>
                                    <PreviewCard
                                        key={`${item.id}-preview-card`}
                                        path={
                                            pageSnapshots[index] &&
                                            URL.createObjectURL(
                                                new Blob([pageSnapshots[index].snapshot.buffer as BlobPart], {
                                                    type: 'image/png',
                                                }),
                                            )
                                        }
                                        type={PreviewType.IMAGE}
                                        itemId={item.id}
                                        fallback={PREVIEW_FALLBACK}
                                        padding="0"
                                        options={[]}
                                        renamingDisabled
                                        variant={PreviewCardVariant.LIST}
                                        selected={item.id === activePageId}
                                        onClickCard={() => {
                                            handleSelectPage(item.id);
                                        }}
                                    />
                                </Card>
                            </PreviewCardBadge>
                        ))}
                </ScrollableContainer>
            </ScrollbarWrapper>
        </Container>
    );
}
export default Pages;
