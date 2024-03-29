import { AvailableIcons, ButtonVariant, useMobileSize } from '@chili-publish/grafx-shared-components';
import { Dispatch, useCallback, useMemo, useState } from 'react';
import { DownloadFormats } from '@chili-publish/studio-sdk';
import NavbarButton from '../navbarButton/NavbarButton';
import Zoom from '../zoom/Zoom';
import { NavbarGroup, NavbarLabel } from './Navbar.styles';
import { NavbarItemType } from './Navbar.types';
import { ProjectConfig } from '../../types/types';
import { useUiConfigContext } from '../../contexts/UiConfigContext';

const useNavbar = (
    projectName: string | undefined,
    goBack: (() => void) | undefined,
    zoom: number,
    undoStackState: { canRedo: boolean; canUndo: boolean },
    projectConfig: ProjectConfig,
) => {
    const { isBackBtnVisible, isDownloadBtnVisible, userInterfaceOutputSettings } = useUiConfigContext();
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

    const navbarItems = useMemo((): NavbarItemType[] => {
        let items = [];
        if (isBackBtnVisible) {
            items.push({
                label: 'Project information',
                content: (
                    <NavbarGroup>
                        <NavbarButton
                            dataId="back-btn"
                            dataTestId="back-btn"
                            dataIntercomId="Go back button"
                            ariaLabel="Go back"
                            icon={AvailableIcons.faArrowLeft}
                            handleOnClick={goBack || (() => null)}
                        />
                        <NavbarLabel aria-label={`Project: ${projectName}`}>{decodeURI(projectName || '')}</NavbarLabel>
                    </NavbarGroup>
                ),
            });
        }
        items = [
            ...items,
            {
                label: 'Actions',
                content: (
                    <NavbarGroup withGap>
                        <NavbarButton
                            dataId="undo-btn"
                            ariaLabel="Undo"
                            icon={AvailableIcons.faArrowTurnDownLeft}
                            flipIconY
                            disabled={!undoStackState.canUndo}
                            handleOnClick={handleUndo}
                        />
                        <NavbarButton
                            dataId="redo-btn"
                            ariaLabel="Redo"
                            icon={AvailableIcons.faArrowTurnDownRight}
                            flipIconY
                            disabled={!undoStackState.canRedo}
                            handleOnClick={handleRedo}
                        />
                    </NavbarGroup>
                ),
            },
        ];
        if (isDownloadBtnVisible) {
            items.push({
                label: 'Download',
                content: (
                    <NavbarButton
                        dataId="navbar-download-btn"
                        dataIntercomId="Download button"
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
                        disabled={userInterfaceOutputSettings?.length === 0}
                    />
                ),
            });
        }
        items = [
            ...items,
            {
                label: 'Zoom',
                content: <Zoom zoom={zoom} zoomIn={zoomIn} zoomOut={zoomOut} />,
                hideOnMobile: true,
            },
        ];
        return items;
    }, [
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
        isBackBtnVisible,
        isDownloadBtnVisible,
        userInterfaceOutputSettings,
    ]);

    const handleDownload = async (
        extension: DownloadFormats,
        updateDownloadState: Dispatch<Partial<Record<DownloadFormats, boolean>>>,
    ) => {
        try {
            updateDownloadState({ [extension]: true });
            const selectedLayoutID = (await window.SDK.layout.getSelected()).parsedData?.id;
            const { data: downloadURL } = await projectConfig.onProjectGetDownloadLink(extension, selectedLayoutID);
            const config = { headers: { Authorization: `Bearer ${projectConfig?.onAuthenticationRequested()}` } };
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
