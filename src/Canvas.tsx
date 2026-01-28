import { LayoutIntent, Page } from '@chili-publish/studio-sdk';
import { useEffect, useState } from 'react';
import { SuiCanvas } from './MainContent.styles';
import { ProjectConfig } from './types/types';
import { getDataIdForSUI, getDataTestIdForSUI } from './utils/dataIds';
import { ChiliEditor } from './App.styles';

interface CanvasProps {
    layoutIntent: LayoutIntent | null;
    pages: Page[];
    projectConfig: ProjectConfig;
    multiLayoutMode: boolean;
    editorId: string;
}
function Canvas({ layoutIntent, pages, projectConfig, multiLayoutMode, editorId }: CanvasProps) {
    const [iframeWindow, setIframeWindow] = useState<Window | null>(null);

    useEffect(() => {
        const iframeContainer = document.getElementById(editorId);
        if (!iframeContainer) return undefined;
        const observer = new MutationObserver(() => {
            const iframeElement = iframeContainer.querySelector('iframe');
            const windowRef = iframeElement?.contentWindow;
            if (windowRef) {
                setIframeWindow(windowRef);
                observer.disconnect();
            }
        });

        observer.observe(iframeContainer, {
            childList: true,
            subtree: true,
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!iframeWindow) return undefined;

        const handleFocusIframe = () => {
            iframeWindow.focus();
        };

        iframeWindow.addEventListener('pointerdown', handleFocusIframe);

        return () => {
            iframeWindow.removeEventListener('pointerdown', handleFocusIframe);
        };
    }, [iframeWindow]);

    return (
        <SuiCanvas
            // intent prop to calculate pages container
            hasMultiplePages={layoutIntent === LayoutIntent.print && pages?.length > 1}
            hasAnimationTimeline={layoutIntent === LayoutIntent.digitalAnimated}
            isBottomBarHidden={projectConfig.uiOptions.widgets?.bottomBar?.visible === false}
            data-id={getDataIdForSUI('canvas')}
            data-testid={getDataTestIdForSUI('canvas')}
            isVisible={!multiLayoutMode}
        >
            <ChiliEditor id={editorId} />
        </SuiCanvas>
    );
}

export default Canvas;
