import { AvailableIcons, ButtonVariant, useMobileSize } from '@chili-publish/grafx-shared-components';
import { Dispatch, useCallback, useMemo, useState } from 'react';
import { DownloadFormats } from '@chili-publish/studio-sdk';
import NavbarButton from '../navbarButton/NavbarButton';
import Zoom from '../zoom/Zoom';
import { NavbarGroup, NavbarLabel } from './Navbar.styles';
import { NavbarItemType } from './Navbar.types';
import { ProjectConfig } from '../../types/types';
import { getDownloadLink } from '../../utils/documentExportHelper';

const useNavbar = (
    projectName: string | undefined,
    goBack: (() => void) | undefined,
    zoom: number,
    undoStackState: { canRedo: boolean; canUndo: boolean },
    projectConfig?: ProjectConfig,
) => {
    const isMobile = useMobileSize();
    const [isDownloadPanelVisible, setIsDownloadPanelVisible] = useState(false);

    const hideDownloadPanel = () => {
        setIsDownloadPanelVisible(false);
    };

    const showDownloadPanel = () => {
        setIsDownloadPanelVisible(true);
    };

    const handleUndo = useCallback(() => {
        (async () => {
            if (undoStackState.canUndo) await window.SDK.undoManager.undo();
        })();
    }, [undoStackState.canUndo]);

    const handleRedo = useCallback(() => {
        (async () => {
            if (undoStackState.canRedo) await window.SDK.undoManager.redo();
        })();
    }, [undoStackState.canRedo]);

    const zoomIn = useCallback(async () => {
        (async () => {
            // 1.142 is the same value used in the engine to zoom in
            await window.SDK.canvas.setZoomPercentage(zoom * 1.142);
        })();
    }, [zoom]);

    const zoomOut = useCallback(async () => {
        (async () => {
            // 0.875 is the same value used in the engine to zoom out
            await window.SDK.canvas.setZoomPercentage(zoom * 0.875);
        })();
    }, [zoom]);

    const navbarItems = useMemo(
        (): NavbarItemType[] => [
            {
                label: 'Project information',
                content: (
                    <NavbarGroup>
                        <NavbarButton
                            ariaLabel="Go back"
                            icon={AvailableIcons.faArrowLeft}
                            handleOnClick={goBack || (() => null)}
                        />
                        <NavbarLabel aria-label={`Project: ${projectName}`}>{decodeURI(projectName || '')}</NavbarLabel>
                    </NavbarGroup>
                ),
            },
            {
                label: 'Actions',
                content: (
                    <NavbarGroup withGap>
                        <NavbarButton
                            ariaLabel="Undo"
                            icon={AvailableIcons.faArrowTurnDownLeft}
                            flipIconY
                            disabled={!undoStackState.canUndo}
                            handleOnClick={handleUndo}
                        />
                        <NavbarButton
                            ariaLabel="Redo"
                            icon={AvailableIcons.faArrowTurnDownRight}
                            flipIconY
                            disabled={!undoStackState.canRedo}
                            handleOnClick={handleRedo}
                        />
                    </NavbarGroup>
                ),
            },
            {
                label: 'Download',
                content: (
                    <NavbarButton
                        ariaLabel="Download"
                        label={
                            !isMobile ? (
                                <NavbarLabel key="Download" hideOnMobile>
                                    Download
                                </NavbarLabel>
                            ) : undefined
                        }
                        icon={AvailableIcons.faArrowDownToLine}
                        variant={ButtonVariant.primary}
                        handleOnClick={showDownloadPanel}
                    />
                ),
            },
            {
                label: 'Zoom',
                content: <Zoom zoom={zoom} zoomIn={zoomIn} zoomOut={zoomOut} />,
                hideOnMobile: true,
            },
        ],
        [
            goBack,
            projectName,
            undoStackState.canUndo,
            undoStackState.canRedo,
            handleUndo,
            handleRedo,
            isMobile,
            zoom,
            zoomIn,
            zoomOut,
        ],
    );

    const handleDownload = async (
        extension: DownloadFormats,
        updateDownloadState: Dispatch<Partial<Record<DownloadFormats, boolean>>>,
    ) => {
        try {
            updateDownloadState({ [extension]: true });
            const selectedLayoutID = (await window.SDK.layout.getSelected()).parsedData?.id;
            const { data: downloadURL } = await getDownloadLink(
                extension,
                projectConfig?.graFxStudioEnvironmentApiBaseUrl ?? '',
                projectConfig?.authToken ?? '',
                selectedLayoutID || '0',
                projectConfig?.projectId ?? '',
            );

            const config = { headers: { Authorization: `Bearer ${projectConfig?.authToken}` } };
            const response = await fetch(downloadURL ?? '', config);

            if (response.status !== 200) return;

            const objectUrl = window.URL.createObjectURL(await response.blob());
            const a = Object.assign(document.createElement('a'), {
                href: objectUrl,
                style: 'display: none',
                download: `export.${extension}`,
            });
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(objectUrl);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        } finally {
            updateDownloadState({ [extension]: false });
        }
        hideDownloadPanel();
    };

    return { navbarItems, showDownloadPanel, hideDownloadPanel, isDownloadPanelVisible, handleDownload };
};

export default useNavbar;
