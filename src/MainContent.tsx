import {
    ToastVariant,
    UiThemeProvider,
    useDebounce,
    useMobileSize,
    useTheme,
} from '@chili-publish/grafx-shared-components';
import StudioSDK, {
    AggregateAsyncError,
    AuthRefreshTypeEnum,
    ConnectorEvent,
    ConnectorType,
    DocumentType,
    GrafxTokenAuthCredentials,
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
import { OutputSettingsContextProvider } from './components/navbar/OutputSettingsContext';
import StudioNavbar from './components/navbar/studioNavbar/StudioNavbar';
import Pages from './components/pagesPanel/Pages';
import MobileVariablesTray from './components/variables/MobileVariablesTray';
import AppProvider from './contexts/AppProvider';
import { useAuthToken } from './contexts/AuthTokenProvider';
import ShortcutProvider from './contexts/ShortcutManager/ShortcutProvider';
import { useSubscriberContext } from './contexts/Subscriber';
import { UiConfigContextProvider } from './contexts/UiConfigContext';
import { VariablePanelContextProvider } from './contexts/VariablePanelContext';
import { SuiCanvas } from './MainContent.styles';
import { defaultUiOptions, Project, ProjectConfig } from './types/types';
import { APP_WRAPPER_ID } from './utils/constants';
import { getDataIdForSUI, getDataTestIdForSUI } from './utils/dataIds';
import { useNotificationManager } from './contexts/NotificantionManager/NotificationManagerContext';

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

function MainContent({ projectConfig, updateToken: setAuthToken }: MainContentProps) {
    const [fetchedDocument, setFetchedDocument] = useState<string | null>(null);
    const [variables, setVariables] = useState<Variable[]>([]);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [animationLength, setAnimationLength] = useState(0);
    const [scrubberTimeMs, setScrubberTimeMs] = useState(0);
    const [animationStatus, setAnimationStatus] = useState(false);
    const [currentZoom, setCurrentZoom] = useState<number>(100);
    const [currentProject, setCurrentProject] = useState<Project>();
    const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
    const [mediaConnectors, setMediaConnectors] = useState<ConnectorInstance[]>([]);
    const [fontsConnectors, setFontsConnectors] = useState<ConnectorInstance[]>([]);
    const [layoutIntent, setLayoutIntent] = useState<LayoutIntent | null>(null);
    const [dataSource, setDataSource] = useState<ConnectorInstance>();

    const [currentSelectedLayout, setSelectedLayout] = useState<Layout | null>(null);
    const [pageSize, setPageSize] = useState<PageSize | null>(null);
    const [layoutPropertiesState, setSelectedPropertiesState] = useState<LayoutPropertiesType | null>(null);
    const [layouts, setLayouts] = useState<LayoutListItemType[]>([]);

    const [multiLayoutMode, setMultiLayoutMode] = useState(false);

    const [pages, setPages] = useState<Page[]>([]);
    const [activePageId, setActivePageId] = useState<string | null>(null);
    const [pagesToRefresh, setPagesToRefresh] = useState<string[]>([]);
    const [isLoadDocumentErrorDialogOpen, setIsLoadDocumentErrorDialogOpen] = useState(false);

    const undoStackState = useMemo(() => ({ canUndo, canRedo }), [canUndo, canRedo]);
    const { subscriber: eventSubscriber } = useSubscriberContext();

    const enableAutoSaveRef = useRef(false);
    const isMobileSize = useMobileSize();

    const { canvas } = useTheme();

    const { authToken } = useAuthToken();

    const { addNotification } = useNotificationManager();

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
        process: connectorAuthenticationProcess,
        createProcess: createAuthenticationProcess,
    } = useConnectorAuthentication();

    useConnectorAuthenticationResult(authResults);

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
        if (!eventSubscriber) {
            return;
        }
        const sdk = new StudioSDK({
            editorId: EDITOR_ID,
            enableNextSubscribers: {
                onVariableListChanged: true,
            },
            async onAuthExpired(request) {
                try {
                    if (request.type === AuthRefreshTypeEnum.grafxToken) {
                        const newToken = await projectConfig.onAuthenticationExpired();
                        setAuthToken(newToken);
                        return new GrafxTokenAuthCredentials(newToken);
                    }

                    // "oAuth2AuthorizationCode" Environment API Connector's authorization entity type
                    // NOTE: We apply .toLowerCase() for both header and entity type as header came with first capital letter where entity type is fully camelCase
                    if (
                        request.type === AuthRefreshTypeEnum.any &&
                        !!request.headerValue?.toLowerCase().includes('oAuth2AuthorizationCode'.toLowerCase()) &&
                        !!projectConfig?.onConnectorAuthenticationRequested
                    ) {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const [_, remoteConnectorId] = request.headerValue.split(';').map((i) => i.trim());
                        const connector = await window.StudioUISDK.next.connector.getById(request.connectorId);
                        const result = await createAuthenticationProcess(
                            async () => {
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                const res = await projectConfig.onConnectorAuthenticationRequested!(remoteConnectorId);
                                return res;
                            },
                            connector.parsedData?.name ?? '',
                            remoteConnectorId,
                        );
                        return result;
                    }
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error(error);
                    return null;
                }
                return null;
            },
            onVariableListChanged: (variableList: Variable[]) => {
                eventSubscriber.emit('onVariableListChanged', variableList);
                setVariables(variableList);
                // NOTE(@pkgacek): because `onDocumentLoaded` action is currently broken,
                // we are using ref to keep track if the `onVariablesListChanged` was called second time.
                if (enableAutoSaveRef.current === true && !projectConfig.sandboxMode) {
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
                    setLayoutIntent((layoutProperties?.intent as Record<string, unknown>)?.value as LayoutIntent);
                }
            },
            onSelectedLayoutIdChanged: async () => {
                const layout = (await window.StudioUISDK.layout.getSelected()).parsedData;
                const layoutIntentData = layout?.intent.value ?? null;

                setSelectedLayout(layout);
                setLayoutIntent(layoutIntentData);

                startTransition(() => {
                    zoomToPage();
                });
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
            onPageSnapshotInvalidated: (invalidatedPageId) => {
                setPagesToRefresh((prev) => {
                    return prev.includes(String(invalidatedPageId)) ? prev : [...prev, String(invalidatedPageId)];
                });
            },
            onPagesChanged: (changedPages) => {
                const visiblePages = changedPages?.filter((i) => i.isVisible);
                setPages(visiblePages);
            },
            onSelectedPageIdChanged: (pageId) => {
                setActivePageId(pageId);
                zoomToPage(pageId);
            },
            // eslint-disable-next-line @typescript-eslint/no-shadow
            onPageSizeChanged: (pageSize) => {
                zoomToPage(pageSize.id);
                setPageSize(pageSize);
            },
            onCustomUndoDataChanged: (customData: Record<string, string>) => {
                eventSubscriber.emit('onCustomUndoDataChanged', customData);
            },
            onLayoutsChanged: (layoutList) => {
                setLayouts(layoutList);
            },
            onAsyncError(asyncError) {
                console.log('asyncError', asyncError);
                (asyncError as any).exceptions.forEach((exception, index) =>
                    addNotification({
                        id: `data-source-validation-${index}`,
                        message: exception.message,
                        type: ToastVariant.NEGATIVE,
                    }),
                );
                
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
        });

        // Connect to ths SDK
        window.StudioUISDK = sdk;
        window.SDK = sdk;
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
        const loadDocument = async () => {
            if (!fetchedDocument) return;

            await window.StudioUISDK.document
                .load(fetchedDocument)
                .then((res) => {
                    setIsDocumentLoaded(res.success);
                })
                .catch((err: Error) => {
                    if ((err.cause as { name: string; message: string })?.name === '303001') {
                        setIsLoadDocumentErrorDialogOpen(true);
                    }
                });
            window.StudioUISDK.next.connector.getAllByType(ConnectorType.media).then(async (res) => {
                if (res.success && res.parsedData) {
                    setMediaConnectors(res.parsedData);
                }
            });

            window.StudioUISDK.next.connector.getAllByType('font' as ConnectorType).then(async (res) => {
                if (res.success && res.parsedData) {
                    setFontsConnectors(res.parsedData);
                }
            });

            window.StudioUISDK.dataSource.getDataSource().then((res) => {
                setDataSource(res.parsedData ?? undefined);
            });

            const layoutIntentData = (await window.StudioUISDK.layout.getSelected()).parsedData?.intent.value || null;
            setLayoutIntent(layoutIntentData);
            zoomToPage();
        };

        loadDocument();
    }, [fetchedDocument, zoomToPage]);

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
        }),
        [currentProject?.name, projectConfig, undoStackState, currentZoom],
    );

    const layoutSectionUIOptions = {
        visible: !multiLayoutMode,
        layoutSwitcherVisible:
            projectConfig.uiOptions.layoutSection?.layoutSwitcherVisible ??
            defaultUiOptions.layoutSection.layoutSwitcherVisible,
        title: projectConfig.uiOptions.layoutSection?.title ?? defaultUiOptions.layoutSection.title,
    };

    return (
        <AppProvider isDocumentLoaded={isDocumentLoaded} isAnimationPlaying={animationStatus} dataSource={dataSource}>
            <ShortcutProvider projectConfig={projectConfig} undoStackState={undoStackState} zoom={currentZoom}>
                <Container>
                    <UiConfigContextProvider projectConfig={projectConfig}>
                        <VariablePanelContextProvider
                            connectors={{ mediaConnectors, fontsConnectors }}
                            variables={variables}
                        >
                            <div id={APP_WRAPPER_ID} className="app">
                                {projectConfig.uiOptions.widgets?.navBar?.visible === false ? null : (
                                    <OutputSettingsContextProvider
                                        projectConfig={projectConfig}
                                        layoutIntent={layoutIntent}
                                    >
                                        {projectConfig.sandboxMode ? (
                                            <UiThemeProvider theme="studio" mode="dark">
                                                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                                                <StudioNavbar {...navbarProps} />
                                            </UiThemeProvider>
                                        ) : (
                                            // eslint-disable-next-line react/jsx-props-no-spreading
                                            <Navbar {...navbarProps} />
                                        )}
                                    </OutputSettingsContextProvider>
                                )}

                                <MainContentContainer
                                    sandboxMode={projectConfig.sandboxMode}
                                    fullHeight={projectConfig.uiOptions.widgets?.navBar?.visible === false}
                                >
                                    {!isMobileSize && (
                                        <LeftPanel
                                            variables={variables}
                                            selectedLayout={currentSelectedLayout}
                                            layouts={layouts}
                                            layoutPropertiesState={layoutPropertiesState}
                                            pageSize={pageSize ?? undefined}
                                            layoutSectionUIOptions={layoutSectionUIOptions}
                                        />
                                    )}
                                    <CanvasContainer>
                                        {isMobileSize && (
                                            <MobileVariablesTray
                                                selectedLayout={currentSelectedLayout}
                                                layouts={layouts}
                                                variables={variables}
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
                                        {layoutIntent === LayoutIntent.digitalAnimated ? (
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
                                                pagesToRefresh={pagesToRefresh}
                                                setPagesToRefresh={setPagesToRefresh}
                                            />
                                        ) : null}
                                    </CanvasContainer>
                                </MainContentContainer>
                                <LoadDocumentErrorDialog
                                    isLoadDocumentErrorDialogOpen={isLoadDocumentErrorDialogOpen}
                                    goBack={projectConfig.onBack}
                                />
                                {pendingAuthentications.length &&
                                    pendingAuthentications.map((authFlow) => (
                                        <ConnectorAuthenticationModal
                                            key={authFlow.connectorId}
                                            name={authFlow.connectorName}
                                            onConfirm={() =>
                                                connectorAuthenticationProcess(authFlow.connectorId)?.start()
                                            }
                                            onCancel={() =>
                                                connectorAuthenticationProcess(authFlow.connectorId)?.cancel()
                                            }
                                        />
                                    ))}
                            </div>
                        </VariablePanelContextProvider>
                    </UiConfigContextProvider>
                </Container>
            </ShortcutProvider>
        </AppProvider>
    );
}

export default React.memo(MainContent);
