import {
    PreviewCard,
    PreviewCardVariant,
    PreviewType,
    ScrollbarWrapper,
    useMobileSize,
} from '@chili-publish/grafx-shared-components';
import { Layout, LayoutListItemType, Page } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useState } from 'react';
import { useLeftPanelAndTrayVisibility } from 'src/core/hooks/useLeftPanelAndTrayVisibility';
import { useUiConfigContext } from '../../contexts/UiConfigContext';
import { PageSnapshot, UiOptions } from '../../types/types';
import { BORDER_SIZE, PAGES_CONTAINER_HEIGHT, PREVIEW_FALLBACK } from '../../utils/constants';
import { Card, Container, ScrollableContainer } from './Pages.styles';
import { PreviewCardBadge } from './PreviewCardBadge';
import { useAttachArrowKeysListener } from './useAttachArrowKeysListener';

interface PagesProps {
    pages: Page[];
    activePageId: string | null;
    pagesToRefresh: string[];
    setPagesToRefresh: React.Dispatch<React.SetStateAction<string[]>>;
    layoutDetails: {
        layouts: LayoutListItemType[];
        selectedLayout: Layout | null;
        layoutSectionUIOptions: UiOptions['layoutSection'] & { visible: boolean };
    };
}

function Pages({ pages, activePageId, pagesToRefresh, setPagesToRefresh, layoutDetails }: PagesProps) {
    const { uiOptions } = useUiConfigContext();
    const { shouldHide: leftPanelIsHidden } = useLeftPanelAndTrayVisibility(layoutDetails);

    const [pageSnapshots, setPageSnapshots] = useState<PageSnapshot[]>([]);
    const isMobileSize = useMobileSize();

    const getPagesSnapshot = useCallback(async (ids: string[]) => {
        const snapArray = ids.map((id) =>
            window.SDK.page.getSnapshot(id).then((snapshot) => ({
                id,
                snapshot: snapshot as unknown as Uint8Array,
            })),
        );
        const awaitedArray = await Promise.all(snapArray);
        setPageSnapshots(awaitedArray);
        return awaitedArray as PageSnapshot[];
    }, []);

    /**
     * by attaching listeners here and not in ShortcutProvider.tsx,
     * 'pages' prop that gets populated via 'onPagesChanged' subscriber,
     * will not trigger rerenders of ShortcutProvider's children,
     * causing multiple query refectch in useMediaDetails
     */
    const { handleSelectPage } = useAttachArrowKeysListener({ pages, activePageId });

    useEffect(() => {
        if (pages?.length && !pageSnapshots.length) {
            getPagesSnapshot(pages.map((i) => i.id));
        }
    }, [pages, pageSnapshots, getPagesSnapshot]);

    useEffect(() => {
        if (!pagesToRefresh.length) return;

        const updateSnapshots = async () => {
            const snapshotsArray = await getPagesSnapshot(pagesToRefresh);
            const updatedSnapshots = await Promise.all(snapshotsArray);

            // Update state once with all new snapshots
            setPageSnapshots((prevSnapshots) => {
                const filteredSnapshots = prevSnapshots.filter((snap) => {
                    return pages.find((p) => p.id === snap.id);
                });
                updatedSnapshots.forEach(({ id, snapshot }) => {
                    const idx = filteredSnapshots.findIndex((item) => item.id === id);
                    if (idx !== -1) {
                        filteredSnapshots[idx] = { ...filteredSnapshots[idx], snapshot };
                    }
                });
                return filteredSnapshots;
            });

            setPagesToRefresh([]);
        };

        const timeoutId = setTimeout(updateSnapshots, 1000);

        // eslint-disable-next-line consistent-return
        return () => {
            clearTimeout(timeoutId);
        };
    }, [pagesToRefresh, setPagesToRefresh, getPagesSnapshot]);

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
                    {!!pages?.length &&
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
