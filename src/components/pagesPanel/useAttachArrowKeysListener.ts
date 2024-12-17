import { useGetIframeAsync } from '@chili-publish/grafx-shared-components';
import { Page } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useState } from 'react';

export const useAttachArrowKeysListener = ({ pages, activePageId }: { pages: Page[]; activePageId: string | null }) => {
    const iframe = useGetIframeAsync({ containerId: 'studio-ui-chili-editor' })?.contentWindow;

    const [selectedPageIndex, setSelectedPageIndex] = useState<number>(-1);

    const handleSelectPage = async (pageId: string) => {
        await window.StudioUISDK.page.select(pageId);
    };
    const handleOnArrowKeyDown = useCallback(
        async (event: KeyboardEvent) => {
            const formElements = ['INPUT', 'TEXTAREA', 'SELECT', 'OPTION'];
            if (formElements.includes((event.target as HTMLElement).tagName)) {
                return;
            }
            switch (event.key) {
                case 'ArrowLeft': {
                    let index = selectedPageIndex - 1;
                    setSelectedPageIndex((prevIndex) => {
                        index = prevIndex > 0 ? prevIndex - 1 : prevIndex;
                        return index;
                    });
                    handleSelectPage(pages[index].id);
                    break;
                }
                case 'ArrowRight': {
                    let index = selectedPageIndex + 1;
                    setSelectedPageIndex((prevIndex) => {
                        index = prevIndex + 1 < pages.length ? prevIndex + 1 : prevIndex;
                        return index;
                    });
                    handleSelectPage(pages[index].id);
                    break;
                }
                default:
                    break;
            }
        },
        [selectedPageIndex, pages],
    );

    useEffect(() => {
        const addShortcutListeners = () => {
            document.addEventListener('keydown', handleOnArrowKeyDown);
            iframe?.addEventListener('keydown', handleOnArrowKeyDown);
        };

        addShortcutListeners();

        return () => {
            document.removeEventListener('keydown', handleOnArrowKeyDown);
            iframe?.removeEventListener('keydown', handleOnArrowKeyDown);
        };
    }, [handleOnArrowKeyDown, iframe]);

    useEffect(() => {
        if (!pages.length || !activePageId) return;
        setSelectedPageIndex(pages.findIndex((i) => i.id === activePageId));
    }, [pages, activePageId]);

    return { handleSelectPage };
};
