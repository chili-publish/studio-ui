import { useCallback, useEffect, useState } from 'react';
import { Page } from '@chili-publish/studio-sdk';
import {
    PreviewCard,
    PreviewCardVariant,
    PreviewType,
    ScrollbarWrapper,
    useMobileSize,
    useTheme,
} from '@chili-publish/grafx-shared-components';
import { ScrollableContainer, Card, Container } from './Pages.styles';
import { PREVIEW_FALLBACK } from '../../utils/constants';
import { PageSnapshot } from '../../types/types';
import { PreviewCardBadge } from './PreviewCardBadge';

interface PagesProps {
    pages: Page[];
    activePageId: string | null;
    pagesToRefresh: string[];
    setPagesToRefresh: React.Dispatch<React.SetStateAction<string[]>>;
}

function Pages({ pages, activePageId, pagesToRefresh, setPagesToRefresh }: PagesProps) {
    const theme = useTheme();
    const [pageSnapshots, setPageSnapshots] = useState<PageSnapshot[]>([]);
    const isMobileSize = useMobileSize();

    const handleSelectPage = async (pageId: string) => {
        await window.StudioUISDK.page.select(pageId);
    };

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
                const newSnapshots = [...prevSnapshots];
                updatedSnapshots.forEach(({ id, snapshot }) => {
                    const idx = newSnapshots.findIndex((item) => item.id === id);
                    if (idx !== -1) {
                        newSnapshots[idx] = { ...newSnapshots[idx], snapshot };
                    }
                });
                return newSnapshots;
            });

            setPagesToRefresh([]);
        };

        const timeoutId = setTimeout(updateSnapshots, 1000);

        // eslint-disable-next-line consistent-return
        return () => {
            clearTimeout(timeoutId);
        };
    }, [pagesToRefresh, setPagesToRefresh, getPagesSnapshot]);

    return (
        <Container themeStyles={theme} isMobileSize={isMobileSize}>
            <ScrollbarWrapper invertScrollbarColors>
                <ScrollableContainer>
                    {!!pages?.length &&
                        pages.map((item, index) => (
                            <PreviewCardBadge badgeNumber={index + 1} key={`badge-${item.id}`}>
                                <Card themeStyles={theme} selected={item.id === activePageId} key={`card-${item.id}`}>
                                    <PreviewCard
                                        key={`${item.id}-preview-card`}
                                        path={
                                            pageSnapshots[index] &&
                                            URL.createObjectURL(
                                                new Blob([pageSnapshots[index].snapshot.buffer], { type: 'image/png' }),
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
