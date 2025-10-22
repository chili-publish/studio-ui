import {
    AvailableIcons,
    BreadCrumb,
    PreviewCard as ChiliPreview,
    Icon,
    Input,
    Panel,
    PreviewCardVariant,
    PreviewType,
    ScrollbarWrapper,
    SelectOptions,
    useInfiniteScrolling,
    useMobileSize,
} from '@chili-publish/grafx-shared-components';
import { EditorResponse, Media, MediaType, MetaData, QueryOptions, QueryPage } from '@chili-publish/studio-sdk';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectConnectorCapabilities } from 'src/store/reducers/mediaReducer';
import { APP_WRAPPER_ID, FOLDER_PREVIEW_THUMBNAIL } from 'src/utils/constants';
import { useUITranslations } from '../../core/hooks/useUITranslations';
import { AssetType } from '../../utils/ApiTypes';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { UNABLE_TO_LOAD_PANEL } from '../../utils/mediaUtils';
import {
    BreadCrumbsWrapper,
    EmptySearchResultContainer,
    LoadPageContainer,
    PanelContentWrapper,
    ResourcesContainer,
    ScrollbarContainer,
    SearchInputWrapper,
    StyledPanelTitle,
} from './ItemBrowser.styles';
import { ItemCache, PreviewResponse } from './ItemCache';
import { PanelType, selectActivePanel } from '../../store/reducers/panelReducer';
import ImagePanelTitle from './ImagePanelTitle';

type ItemBrowserProps<T extends { id: string }> = {
    isPanelOpen: boolean;
    connectorId: string;
    queryCall: (connector: string, options: QueryOptions, context: MetaData) => Promise<EditorResponse<QueryPage<T>>>;
    previewCall: (id: string) => Promise<Uint8Array>;
    convertToPreviewType: (_: AssetType) => PreviewType;
    onSelect: (items: T) => Promise<void | null>;
};

const SKELETONS = [...Array.from(Array(10).keys())];

const getPreviewThumbnail = (type: PreviewType, path?: string): string | undefined => {
    if (type === PreviewType.COLLECTION) return FOLDER_PREVIEW_THUMBNAIL;

    return path;
};

function ItemBrowser<
    T extends {
        id: string;
        type: MediaType;
        name: string;
        relativePath: string;
        extension?: string;
    },
>(props: React.PropsWithChildren<ItemBrowserProps<T>>) {
    const { isPanelOpen, connectorId, queryCall, previewCall, onSelect, convertToPreviewType } = props;
    const activePanel = useSelector(selectActivePanel);

    const [selectedItems, setSelectedItems] = useState<Media[]>([]);
    const [navigationStack, setNavigationStack] = useState<string[]>([]);
    const [searchKeyWord, setSearchKeyWord] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [breadcrumbStack, setBreadcrumbStack] = useState<string[]>([]);
    const [nextPageToken, setNextPageToken] = useState<{ token: string | null; requested: boolean }>({
        token: null,
        requested: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [list, setList] = useState<ItemCache<T>[]>([]);
    const moreData = !!nextPageToken?.token;
    const isMobileSize = useMobileSize();
    const { getUITranslation } = useUITranslations();
    const connectorCapabilities = useSelector(selectConnectorCapabilities);

    const onScroll = () => {
        setNextPageToken((t) => {
            return { token: t.token, requested: t.token !== null };
        });
    };
    const { infiniteScrollingRef } = useInfiniteScrolling(moreData && !isLoading, onScroll);
    // whenever the navigation stack changes, we need to reset our view
    // as we need to reload the first page of the new collection
    useEffect(() => {
        setNextPageToken(() => {
            return { token: null, requested: true };
        });
        setList(() => []);
    }, [navigationStack, searchQuery]);

    useEffect(() => {
        setBreadcrumbStack([]);
        setNavigationStack([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePanel]);

    // nextPagetoken is first set with 'requested: false' whenever we know the next
    // pagetoken. When the last item of the previous page comes into view (in html)
    // then we flip the requested to 'true' to trigger this effect.
    useEffect(() => {
        // initially set to false, which means the 'fetch' result won't be ignored.
        // in case the useEffect runs again (dependencies change) while the promise did not resolve, the cleanup function
        // makes sure that the result that is not relevant anymore, won't affect the state.
        let ignore = false;
        if (!nextPageToken.requested) return;
        setIsLoading(true);
        // declare the async data fetching function
        const fetchData = async () => {
            if (activePanel !== PanelType.IMAGE_PANEL) return;
            if (connectorCapabilities[connectorId]?.query) {
                const data = await queryCall(
                    connectorId,
                    {
                        collection: `/${navigationStack?.join('/') ?? ''}`,
                        pageToken: nextPageToken.token ? nextPageToken.token : '',
                        pageSize: 15,
                        ...(connectorCapabilities[connectorId]?.filtering && { filter: [searchQuery] }),
                    },
                    {},
                );
                // parse the token used if we need to fetch the next page
                if (data.success && data.parsedData && data.parsedData.data) {
                    if (!ignore) {
                        const token = data.parsedData.nextPageToken ? parseNextPageToken(data) : null;

                        setNextPageToken(() => {
                            return { token, requested: false };
                        });
                        setIsLoading(false);

                        // convert to ItemCache to memoize the preview download call
                        const itemsWithCache = data.parsedData.data.map((r: T) => new ItemCache<T>(r));
                        setList((current) => [...current, ...itemsWithCache]);
                    }
                }
            }
        };

        function parseNextPageToken(data: EditorResponse<QueryPage<T>>): string {
            if (!data.parsedData?.nextPageToken) {
                return '';
            }

            const rawToken = data.parsedData.nextPageToken;

            try {
                return new URL(rawToken).searchParams.get('nextPageToken') ?? '';
            } catch (error) {
                return rawToken;
            }
        }

        // call the function
        fetchData().then(() => {
            setIsLoading(false);
        });

        // eslint-disable-next-line consistent-return
        return () => {
            ignore = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nextPageToken.requested, nextPageToken.token, activePanel, searchQuery]);

    useEffect(() => {
        return () => {
            setSelectedItems([]);
            setNavigationStack([]);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getKey = useCallback((str: string, idx: number) => encodeURI(`${str},${idx}`), []);

    const formatRelativePath = (item: T) => {
        const { name, relativePath } = item;
        if (!relativePath) return '/';
        if (!relativePath.includes(name)) return relativePath + name;
        return relativePath;
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const onItemClick = async (item: T) => {
        const itemType = convertToPreviewType(item.type as unknown as AssetType);
        if (itemType === PreviewType.COLLECTION) {
            setNavigationStack(() => {
                setIsLoading(true);
                return toNavigationStack(formatRelativePath(item));
            });
            setBreadcrumbStack((currentStack) => [...currentStack, item.name]);
        } else {
            await onSelect(item);
            setNavigationStack([]);
            setSearchQuery('');
            setSearchKeyWord('');
        }
    };

    const elements = list.map((listItem, idx) => {
        const itemType = convertToPreviewType(listItem.instance.type as unknown as AssetType);

        const previewByteArray: () => Promise<PreviewResponse> = () =>
            listItem.createOrGetDownloadPromise(() => previewCall(listItem.instance.id));

        const defaultProps = {
            key: getKey(
                `${formatRelativePath(listItem.instance)}-${listItem.instance.name}-${listItem.instance.id}`,
                idx,
            ),
            dataId: `${getDataIdForSUI(`media-card-preview-${listItem.instance.name}`)}`,
            dataTestId: `${getDataTestIdForSUI(`media-card-preview-${listItem.instance.name}`)}`,
            itemId: listItem.instance.id,
            name: listItem.instance.name,
            type: itemType as unknown as PreviewType,
            path: getPreviewThumbnail(itemType as unknown as PreviewType, formatRelativePath(listItem.instance)),
            metaData:
                listItem?.instance?.extension?.toUpperCase() ??
                (itemType?.replace('collection', getUITranslation(['panels', 'media', 'folderAssetLabel'], 'Folder')) ||
                    ''),
            renameItem: () => null,
            options: [],
            padding: '0',
            footerTopMargin: '0.75rem',
            selected: selectedItems[0]?.id === listItem.instance.id,
            onClickCard: () => onItemClick(listItem.instance),
            renamingDisabled: true,
            fallback: UNABLE_TO_LOAD_PANEL,
        };
        return itemType === PreviewType.COLLECTION ? (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <ChiliPreview {...defaultProps} />
        ) : (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <ChiliPreview {...defaultProps} byteArray={previewByteArray} />
        );
    });

    const breacrumbStackString = useMemo(() => {
        return breadcrumbStack?.join('\\') ?? '';
    }, [breadcrumbStack]);

    const updateNavigationStack = useCallback(
        (selected: SelectOptions) => {
            const pathIndex = selected.value as number;

            const newNavigationStack = navigationStack?.splice(0, pathIndex);
            const newBreadcrumbStack = breadcrumbStack?.splice(0, pathIndex);
            setNavigationStack(newNavigationStack);
            setBreadcrumbStack(newBreadcrumbStack);
        },
        [navigationStack, breadcrumbStack],
    );

    if (!isPanelOpen) {
        return null;
    }

    // eslint-disable-next-line no-nested-ternary
    const panelTitle = isMobileSize ? null : activePanel === PanelType.IMAGE_PANEL ? <ImagePanelTitle /> : null;

    const filteringEnabled = connectorCapabilities[connectorId]?.filtering;
    const navigationEnabled = !searchQuery && breadcrumbStack.length > 0;

    const handleSearch = (keyword: string) => {
        setSearchQuery(keyword);
        setNavigationStack([]);
        setBreadcrumbStack([]);
    };
    return (
        <>
            <StyledPanelTitle />
            <Panel
                title={panelTitle}
                dataId={getDataIdForSUI('widget-media-panel')}
                dataTestId={getDataTestIdForSUI('widget-media-panel')}
                height="100%"
                showHeaderSeparator={false}
            >
                <PanelContentWrapper>
                    {navigationEnabled ? (
                        <BreadCrumbsWrapper>
                            <BreadCrumb
                                dataId={getDataIdForSUI('toolbar-breadcrumb')}
                                dataTestId={getDataTestIdForSUI('toolbar-breadcrumb')}
                                path={`${getUITranslation(['panels', 'media', 'rootNavPathLabel'], 'Home')}${breacrumbStackString.length ? '\\' : ''}${breacrumbStackString}`}
                                onClick={updateNavigationStack}
                                folderDropdownConfig={{
                                    fullDisplayOnOverflowParent: false,
                                    style: { width: '11rem' },
                                    anchorId: APP_WRAPPER_ID,
                                }}
                            />
                        </BreadCrumbsWrapper>
                    ) : null}
                    {filteringEnabled ? (
                        <SearchInputWrapper hasSearchQuery={!!searchQuery} isMobile={isMobileSize}>
                            <Input
                                type="text"
                                name="search"
                                placeholder={getUITranslation(['panels', 'media', 'searchPlaceholder'], 'Search')}
                                value={searchKeyWord}
                                onChange={(e) => setSearchKeyWord(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSearch(searchKeyWord);
                                }}
                                width="260px"
                                leftIcon={{
                                    icon: (
                                        <Icon
                                            dataId={getDataIdForSUI('media-panel-search-icon')}
                                            dataTestId={getDataTestIdForSUI('media-panel-search-icon')}
                                            icon={AvailableIcons.faMagnifyingGlass}
                                        />
                                    ),
                                    label: 'Search icon',
                                }}
                                dataId={getDataIdForSUI('media-panel-search-input')}
                                dataTestId={getDataTestIdForSUI('media-panel-search-input')}
                                rightIcon={
                                    searchKeyWord
                                        ? {
                                              label: 'Clear search icon',
                                              icon: (
                                                  <Icon
                                                      dataId={getDataIdForSUI('media-panel-clear-search-icon')}
                                                      dataTestId={getDataTestIdForSUI('media-panel-clear-search-icon')}
                                                      icon={AvailableIcons.faXmark}
                                                  />
                                              ),
                                              onClick: () => {
                                                  setSearchKeyWord('');
                                                  setSearchQuery('');
                                              },
                                          }
                                        : undefined
                                }
                                isHighlightOnClick
                            />
                        </SearchInputWrapper>
                    ) : null}
                    <ScrollbarContainer>
                        <ScrollbarWrapper height="100%">
                            {elements.length === 0 && !isLoading && searchQuery && (
                                <EmptySearchResultContainer>
                                    {getUITranslation(
                                        ['panels', 'media', 'noSearchResults'],
                                        'No search results found. Maybe try another keyword?',
                                    )}
                                </EmptySearchResultContainer>
                            )}
                            <ResourcesContainer
                                data-id={getDataIdForSUI('resources-container')}
                                data-testid={getDataTestIdForSUI('resources-container')}
                            >
                                {elements}
                                {isLoading &&
                                    SKELETONS.map((el) => (
                                        <ChiliPreview
                                            key={el}
                                            itemId={el.toString()}
                                            variant={PreviewCardVariant.GRID}
                                            padding="0"
                                            type={PreviewType.COLLECTION}
                                            isSkeleton
                                            onClickCard={() => null}
                                            renamingDisabled
                                        />
                                    ))}
                                <LoadPageContainer>
                                    <div ref={infiniteScrollingRef} />
                                </LoadPageContainer>
                            </ResourcesContainer>
                        </ScrollbarWrapper>
                    </ScrollbarContainer>
                </PanelContentWrapper>
            </Panel>
        </>
    );
}

function toNavigationStack(path: string): string[] {
    return path.replaceAll('\\', '/').replace(/^\/+/, '').split('/');
}

export default ItemBrowser;
