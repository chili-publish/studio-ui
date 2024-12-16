import { Page } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useState } from 'react';

export const useSelectPage = ({ pages, activePageId }: { pages: Page[]; activePageId: string | null }) => {
    const [selectedPageIndex, setSelectedPageIndex] = useState<number>(-1);

    const handleOnArrowKeyDown = useCallback(
        async (event: KeyboardEvent) => {
            switch (event.key) {
                case 'ArrowLeft': {
                    let index = selectedPageIndex - 1;
                    setSelectedPageIndex((prevIndex) => {
                        index = prevIndex > 0 ? prevIndex - 1 : prevIndex;
                        return index;
                    });
                    (async () => {
                        await window.StudioUISDK.page.select(pages[index].id);
                    })();
                    break;
                }
                case 'ArrowRight': {
                    let index = selectedPageIndex + 1;
                    setSelectedPageIndex((prevIndex) => {
                        index = prevIndex + 1 < pages.length ? prevIndex + 1 : prevIndex;
                        return index;
                    });
                    (async () => {
                        await window.StudioUISDK.page.select(pages[index].id);
                    })();
                    break;
                }
                default:
                    break;
            }
        },
        [selectedPageIndex, pages],
    );

    useEffect(() => {
        if (!pages.length || !activePageId) return;
        const found = pages.findIndex((i) => i.id === activePageId);
        setSelectedPageIndex(found !== -1 ? found : 0);
    }, [pages, activePageId]);

    return { handleOnArrowKeyDown, selectedPageIndex };
};
