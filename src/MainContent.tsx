import { UiThemeProvider, useDebounce, useMobileSize, useTheme } from '@chili-publish/grafx-shared-components';
import StudioSDK, {
    ConnectorEvent,
    DocumentType,
    Layout,
    LayoutIntent,
    LayoutListItemType,
    LayoutPropertiesType,
    Page,
    PageSize,
    Variable,
    WellKnownConfigurationKeys,
} from '@chili-publish/studio-sdk';
import { ConnectorInstance } from '@chili-publish/studio-sdk/lib/src/next';
import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import packageInfo from '../package.json';
import './App.css';
import { CanvasContainer, Container, MainContentContainer } from './App.styles';
import AnimationTimeline from './components/animationTimeline/AnimationTimeline';
import {
    ConnectorAuthenticationModal,
    useConnectorAuthentication,
    useConnectorAuthenticationResult,
} from './components/connector-authentication';
import HtmlRenderer from './components/htmlRenderer/HtmlRenderer';
import LeftPanel from './components/layout-panels/leftPanel/LeftPanel';
import LoadDocumentErrorDialog from './components/load-document-error/LoadDocumentErrorDialog';
import Navbar from './components/navbar/Navbar';
import StudioNavbar from './components/navbar/studioNavbar/StudioNavbar';
import { UserInterfaceDetailsContextProvider } from './components/navbar/UserInterfaceDetailsContext';
import Pages from './components/pagesPanel/Pages';
import MobileVariables from './components/variables/MobileVariables';
import AppProvider from './contexts/AppProvider';
import { useAuthToken } from './contexts/AuthTokenProvider';
import ShortcutProvider from './contexts/ShortcutManager/ShortcutProvider';
import { useSubscriberContext } from './contexts/Subscriber';
import { UiConfigContextProvider } from './contexts/UiConfigContext';
import { useEditorAuthExpired } from './core/hooks/useEditorAuthExpired';
import { useMediaConnectors } from './editor/useMediaConnectors';
import { SuiCanvas } from './MainContent.styles';
import { useAppDispatch } from './store';
import { setConfiguration } from './store/reducers/documentReducer';
import { LoadDocumentError, Project, ProjectConfig } from './types/types';
import { useDataRowExceptionHandler } from './useDataRowExceptionHandler';
import { APP_WRAPPER_ID } from './utils/constants';
import { getDataIdForSUI, getDataTestIdForSUI } from './utils/dataIds';
import { useDirection } from './hooks/useDirection';
import { setVariables } from './store/reducers/variableReducer';

declare global {
    interface Window {
        StudioUISDK: StudioSDK;
        SDK: StudioSDK;
    }
}

const EDITOR_ID = 'studio-ui-chili-editor';
interface MainContentProps {
    projectConfig: ProjectConfig;
    updateToken: (newValue: string) => void;
}

function MainContent({ projectConfig, updateToken }: MainContentProps) {
    const dispatch = useAppDispatch();
    const [fetchedDocument, setFetchedDocument] = useState<string | null>(null);
    // const [variables, setVariables] = useState<Variable[]>([]);

    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [animationLength, setAnimationLength] = useState<number | undefined>();
    const [scrubberTimeMs, setScrubberTimeMs] = useState(0);
    const [animationStatus, setAnimationStatus] = useState(false);
    const [currentZoom, setCurrentZoom] = useState<number>(100);
    const [currentProject, setCurrentProject] = useState<Project>();
    const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
    const [layoutIntent, setLayoutIntent] = useState<LayoutIntent | null>(null);
    const [dataSource, setDataSource] = useState<ConnectorInstance>();

    const [currentSelectedLayout, setSelectedLayout] = useState<Layout | null>(null);
    const [pageSize, setPageSize] = useState<PageSize | null>(null);
    const [layoutPropertiesState, setSelectedPropertiesState] = useState<LayoutPropertiesType>(null);
    const [layouts, setLayouts] = useState<LayoutListItemType[]>([]);

    const [multiLayoutMode, setMultiLayoutMode] = useState(false);

    const [pages, setPages] = useState<Page[]>([]);
    const [activePageId, setActivePageId] = useState<string | null>(null);
    const [loadDocumentError, setLoadDocumentError] = useState<{ isOpen: boolean; error: LoadDocumentError }>();

    const undoStackState = useMemo(() => ({ canUndo, canRedo }), [canUndo, canRedo]);
    const { subscriber: eventSubscriber } = useSubscriberContext();

    const enableAutoSaveRef = useRef(false);

    const isMobileSize = useMobileSize();
    const { canvas } = useTheme();
    const { authToken } = useAuthToken();
    const { loadConnectors } = useMediaConnectors();

    const [sdkRef, setSDKRef] = useState<StudioSDK>();
    useDataRowExceptionHandler(sdkRef);

    const { direction, updateDirection } = useDirection();

    // Initialize direction from projectConfig
    useEffect(() => {
        const initialDirection = projectConfig.uiOptions.uiDirection || 'ltr';
        updateDirection(initialDirection);
    }, [projectConfig.uiOptions.uiDirection, updateDirection]);

    const saveDocumentDebounced = useDebounce(() =>
        projectConfig.onProjectSave(async () => {
            const { data } = await window.StudioUISDK.document.getCurrentState();

            if (!data) {
                throw new Error('Document data is empty');
            }

            return data;
        }),
    );

    const {
        pendingAuthentications,
        authResults,
        getProcess: getConnectorAuthenticationProcess,
        createProcess: createAuthenticationProcess,
    } = useConnectorAuthentication();

    useConnectorAuthenticationResult(authResults);

    const handleAuthExpired = useEditorAuthExpired(
        projectConfig.onAuthenticationExpired,
        updateToken,
        projectConfig?.onConnectorAuthenticationRequested,
        createAuthenticationProcess,
    );

    const zoomToPage = useCallback(async (pageId: string | null = null) => {
        const iframe = document.getElementById(EDITOR_ID)?.getElementsByTagName('iframe')?.[0]?.getBoundingClientRect();
        const zoomParams = {
            pageId,
            left: 0,
            top: 0,
            width: iframe?.width,
            height: iframe?.height,
        };
        await window.StudioUISDK.canvas.zoomToPage(
            zoomParams.pageId,
            zoomParams.left,
            zoomParams.top,
            zoomParams.width,
            zoomParams.height,
        );
    }, []);

    useEffect(() => {
        if (projectConfig.onSetMultiLayout) {
            projectConfig.onSetMultiLayout(setMultiLayoutMode);
        }
    }, [projectConfig, projectConfig.onSetMultiLayout]);

    useEffect(() => {
        projectConfig
            .onProjectInfoRequested(projectConfig.projectId)
            .then((project) => {
                setCurrentProject(project);
            })
            .catch((err: Error) => {
                // eslint-disable-next-line no-console
                console.log(`[${MainContent.name}]`, err);
                return err;
            });
    }, [projectConfig.onProjectInfoRequested, projectConfig.projectId, projectConfig]);

    useEffect(() => {
        if (!eventSubscriber) {
            return;
        }
        const shouldSaveDocument = () => {
            return enableAutoSaveRef.current === true && !projectConfig.sandboxMode;
        };
        const sdk = new StudioSDK({
            editorId: EDITOR_ID,
            enableNextSubscribers: {
                onVariableListChanged: true,
            },
            onAuthExpired: handleAuthExpired,
            onVariableListChanged: (variableList: Variable[]) => {
                eventSubscriber.emit('onVariableListChanged', variableList);
                dispatch(setVariables(variableList));

                if (shouldSaveDocument()) {
                    saveDocumentDebounced();
                }

                if (enableAutoSaveRef.current === false) {
                    enableAutoSaveRef.current = true;
                }
            },
            onConnectorEvent: (event: ConnectorEvent) => {
                eventSubscriber.emit('onConnectorEvent', event);
            },
            onSelectedLayoutPropertiesChanged: (layoutProperties) => {
                if (layoutProperties) {
                    setSelectedPropertiesState(layoutProperties);
                    setAnimationLength(layoutProperties.timelineLengthMs.value);
                    setLayoutIntent(layoutProperties.intent.value);
                }
            },
            onSelectedLayoutIdChanged: async () => {
                const layout = (await window.StudioUISDK.layout.getSelected()).parsedData;
                const layoutIntentData = layout?.intent.value ?? null;

                setSelectedLayout(layout);
                setLayoutIntent(layoutIntentData);

                if (!multiLayoutMode) {
                    startTransition(() => {
                        zoomToPage();
                    });
                }
                if (shouldSaveDocument()) {
                    saveDocumentDebounced();
                }
            },
            onScrubberPositionChanged: (animationPlayback) => {
                setAnimationStatus(animationPlayback?.animationIsPlaying || false);
                setScrubberTimeMs(animationPlayback?.currentAnimationTimeMs || 0);
            },
            onUndoStackStateChanged: (undoStackStateValue) => {
                setCanUndo(undoStackStateValue.canUndo);
                setCanRedo(undoStackStateValue.canRedo);
            },
            onZoomChanged: (zoom) => {
                setCurrentZoom(zoom);
            },

            onPagesChanged: (changedPages) => {
                const visiblePages = changedPages?.filter((i) => i.isVisible);
                setPages(visiblePages);
            },
            onSelectedPageIdChanged: (pageId) => {
                setActivePageId(pageId);
                if (!multiLayoutMode) {
                    zoomToPage(pageId);
                }
            },

            onPageSizeChanged: (size) => {
                if (!multiLayoutMode) {
                    zoomToPage(size.id);
                }
                setPageSize(size);
                if (shouldSaveDocument()) {
                    saveDocumentDebounced();
                }
            },
            onCustomUndoDataChanged: (customData: Record<string, string>) => {
                eventSubscriber.emit('onCustomUndoDataChanged', customData);
            },
            onLayoutsChanged: (layoutList) => {
                setLayouts(layoutList);
            },
            studioStyling: { uiBackgroundColorHex: canvas.backgroundColor },
            documentType: DocumentType.project,
            studioOptions: {
                shortcutOptions: {
                    debugPanel: { enabled: false },
                    ellipse: { enabled: false },
                    hand: { enabled: true },
                    image: { enabled: false },
                    polygon: { enabled: false },
                    rectangle: { enabled: false },
                    select: { enabled: false },
                    text: { enabled: false },
                    zoom: { enabled: false },
                    viewMode: { enabled: false },
                },
            },
            editorLink: projectConfig.editorLink,
            enableQueryCallCache: true,
        });

        // Connect to ths SDK
        window.StudioUISDK = sdk;
        window.SDK = sdk;

        setSDKRef(sdk);
        window.StudioUISDK.loadEditor();

        // loadEditor is a synchronous call after which we are sure
        // the connection to the engine is established
        projectConfig.onProjectLoaded(currentProject as Project);

        projectConfig
            .onProjectDocumentRequested(projectConfig.projectId)
            .then((template) => {
                setFetchedDocument(template);
            })
            .catch((err: Error) => {
                // eslint-disable-next-line no-console
                console.log(`[${MainContent.name}]`, err);
                return err;
            });

        // eslint-disable-next-line no-console
        console.table({
            'SDK version': packageInfo.dependencies['@chili-publish/studio-sdk'],
            'Studio UI version': packageInfo.version.split('-')[0],
        });
        // eslint-disable-next-line consistent-return
        return () => {
            // Prevent loading multiple iframes
            const iframeContainer = document.getElementsByTagName('iframe')[0];
            iframeContainer?.remove();
            enableAutoSaveRef.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventSubscriber]);

    useEffect(() => {
        if (currentProject?.template?.id) {
            window.StudioUISDK.configuration.setValue(
                WellKnownConfigurationKeys.GraFxStudioTemplateId,
                currentProject.template.id,
            );
        }
    }, [currentProject?.template?.id]);

    useEffect(() => {
        (async () => {
            await window.StudioUISDK.configuration.setValue(WellKnownConfigurationKeys.GraFxStudioAuthToken, authToken);
        })();
    }, [authToken]);

    useEffect(() => {
        (async () => {
            await window.StudioUISDK.tool.setHand();
        })();
    }, []);

    useEffect(() => {
        dispatch(
            setConfiguration({ graFxStudioEnvironmentApiBaseUrl: projectConfig.graFxStudioEnvironmentApiBaseUrl }),
        );
    }, [dispatch, projectConfig.graFxStudioEnvironmentApiBaseUrl]);

    useEffect(() => {
        const loadDocument = async () => {
            if (!fetchedDocument) return;

            try {
                const result = await window.StudioUISDK.document.load(fetchedDocument);
                setIsDocumentLoaded(result.success);

                loadConnectors();

                window.StudioUISDK.dataSource.getDataSource().then((res) => {
                    setDataSource(res.parsedData ?? undefined);
                });
            } catch (err: unknown) {
                const errorCode = ((err as Error).cause as { name: string; message: string })?.name;
                if (errorCode === '303011') {
                    setLoadDocumentError({ isOpen: true, error: LoadDocumentError.PARSING_ERROR });
                } else if (errorCode === '303012') {
                    setLoadDocumentError({ isOpen: true, error: LoadDocumentError.FORMAT_ERROR });
                } else if (errorCode === '303001') {
                    setLoadDocumentError({ isOpen: true, error: LoadDocumentError.VERSION_ERROR });
                } else {
                    setLoadDocumentError({ isOpen: true, error: LoadDocumentError.TECHNICAL_ERROR });
                }
            }
        };

        loadDocument();
    }, [fetchedDocument, loadConnectors]);

    useEffect(() => {
        if (!multiLayoutMode && isDocumentLoaded) zoomToPage();
    }, [isDocumentLoaded, multiLayoutMode, zoomToPage]);

    const navbarProps = useMemo(
        () => ({
            projectName: currentProject?.name || projectConfig.projectName || '',
            goBack: projectConfig.onBack,
            projectConfig,
            undoStackState,
            zoom: currentZoom,
            selectedLayoutId: currentSelectedLayout?.id ?? null,
        }),
        [currentProject?.name, projectConfig, undoStackState, currentZoom, currentSelectedLayout?.id],
    );

    const layoutSectionUIOptions = {
        visible: !multiLayoutMode,
        layoutSwitcherVisible: projectConfig.uiOptions.layoutSection?.layoutSwitcherVisible,
        title: projectConfig.uiOptions.layoutSection?.title,
    };
    return (
        <AppProvider isDocumentLoaded={isDocumentLoaded} isAnimationPlaying={animationStatus} dataSource={dataSource}>
            <ShortcutProvider projectConfig={projectConfig} undoStackState={undoStackState} zoom={currentZoom}>
                <Container>
                    <UiConfigContextProvider projectConfig={projectConfig}>
                        <div id={APP_WRAPPER_ID} className="app" dir={direction}>
                            <UserInterfaceDetailsContextProvider
                                projectConfig={projectConfig}
                                layoutIntent={layoutIntent}
                            >
                                {/* eslint-disable-next-line no-nested-ternary */}
                                {projectConfig.uiOptions.widgets?.navBar?.visible ===
                                false ? null : projectConfig.sandboxMode ? (
                                    <UiThemeProvider theme="studio" mode="dark">
                                        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                                        <StudioNavbar {...navbarProps} />
                                    </UiThemeProvider>
                                ) : (
                                    // eslint-disable-next-line react/jsx-props-no-spreading
                                    <Navbar {...navbarProps} />
                                )}

                                <MainContentContainer
                                    sandboxMode={projectConfig.sandboxMode}
                                    fullHeight={projectConfig.uiOptions.widgets?.navBar?.visible === false}
                                >
                                    {!isMobileSize && (
                                        <LeftPanel
                                            selectedLayout={currentSelectedLayout}
                                            layouts={layouts}
                                            layoutPropertiesState={layoutPropertiesState}
                                            pageSize={pageSize ?? undefined}
                                            layoutSectionUIOptions={layoutSectionUIOptions}
                                        />
                                    )}
                                    <CanvasContainer>
                                        {isMobileSize && (
                                            <MobileVariables
                                                selectedLayout={currentSelectedLayout}
                                                layouts={layouts}
                                                layoutPropertiesState={layoutPropertiesState}
                                                pageSize={pageSize ?? undefined}
                                                layoutSectionUIOptions={layoutSectionUIOptions}
                                                isTimelineDisplayed={layoutIntent === LayoutIntent.digitalAnimated}
                                                isPagesPanelDisplayed={
                                                    layoutIntent === LayoutIntent.print && pages?.length > 1
                                                }
                                            />
                                        )}
                                        {projectConfig.customElement && (
                                            <HtmlRenderer
                                                content={projectConfig.customElement}
                                                isVisible={multiLayoutMode}
                                            />
                                        )}
                                        <SuiCanvas
                                            // intent prop to calculate pages container
                                            hasMultiplePages={layoutIntent === LayoutIntent.print && pages?.length > 1}
                                            hasAnimationTimeline={layoutIntent === LayoutIntent.digitalAnimated}
                                            isBottomBarHidden={
                                                projectConfig.uiOptions.widgets?.bottomBar?.visible === false
                                            }
                                            data-id={getDataIdForSUI('canvas')}
                                            data-testid={getDataTestIdForSUI('canvas')}
                                            isVisible={!multiLayoutMode}
                                        >
                                            <div className="chili-editor" id={EDITOR_ID} />
                                        </SuiCanvas>
                                        {layoutIntent === LayoutIntent.digitalAnimated &&
                                        typeof animationLength === 'number' ? (
                                            <AnimationTimeline
                                                scrubberTimeMs={scrubberTimeMs}
                                                animationLength={animationLength}
                                                isAnimationPlaying={animationStatus}
                                            />
                                        ) : null}
                                        {layoutIntent === LayoutIntent.print && pages?.length > 1 ? (
                                            <Pages
                                                pages={pages}
                                                activePageId={activePageId}
                                                layoutDetails={{
                                                    selectedLayout: currentSelectedLayout,
                                                    layouts,
                                                    layoutSectionUIOptions,
                                                }}
                                            />
                                        ) : null}
                                    </CanvasContainer>
                                </MainContentContainer>
                            </UserInterfaceDetailsContextProvider>
                            <LoadDocumentErrorDialog
                                loadDocumentError={loadDocumentError}
                                goBack={projectConfig?.onBack}
                            />
                            {pendingAuthentications.length > 0 &&
                                pendingAuthentications.map((authFlow) => (
                                    <ConnectorAuthenticationModal
                                        key={authFlow.remoteConnectorId}
                                        name={authFlow.connectorName}
                                        onConfirm={() =>
                                            getConnectorAuthenticationProcess(authFlow.remoteConnectorId)?.start()
                                        }
                                        onCancel={() =>
                                            getConnectorAuthenticationProcess(authFlow.remoteConnectorId)?.cancel()
                                        }
                                    />
                                ))}
                        </div>
                    </UiConfigContextProvider>
                </Container>
            </ShortcutProvider>
        </AppProvider>
    );
}

export default React.memo(MainContent);
