import {
    AvailableIcons,
    BreadCrumb,
    PreviewCard as ChiliPreview,
    Colors,
    Icon,
    Input,
    Panel,
    PreviewCardVariant,
    PreviewType,
    ScrollbarWrapper,
    useInfiniteScrolling,
    useMobileSize,
} from '@chili-publish/grafx-shared-components';
import { EditorResponse, Media, MediaType, MetaData, QueryOptions, QueryPage } from '@chili-publish/studio-sdk';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { ContentType } from '../../contexts/VariablePanelContext.types';
import { AssetType } from '../../utils/ApiTypes';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import {
    BreadCrumbsWrapper,
    LoadPageContainer,
    ResourcesContainer,
    SearchInputWrapper,
    EmptySearchResultContainer,
} from './ItemBrowser.styles';
import { ItemCache } from './ItemCache';

const TOP_BAR_HEIGHT_REM = '4rem';
const TOP_BAR_BORDER_HEIGHT = '1px';
const MEDIA_PANEL_TOOLBAR_HEIGHT_REM = '3rem';
const BREADCRUMBS_HEIGHT_REM = '3.5rem';

const leftPanelHeight = `
    calc(100vh
        - ${TOP_BAR_HEIGHT_REM}
        - ${TOP_BAR_BORDER_HEIGHT}
        - ${MEDIA_PANEL_TOOLBAR_HEIGHT_REM}
        - ${BREADCRUMBS_HEIGHT_REM}
    )`;

type ItemBrowserProps<T extends { id: string }> = {
    isPanelOpen: boolean;
    connectorId: string;
    height?: string;
    queryCall: (connector: string, options: QueryOptions, context: MetaData) => Promise<EditorResponse<QueryPage<T>>>;
    previewCall: (id: string) => Promise<Uint8Array>;
    convertToPreviewType: (_: AssetType) => PreviewType;
    onSelect: (items: T[]) => void | null;
};

const SKELETONS = [...Array.from(Array(10).keys())];

const getPreviewThumbnail = (type: PreviewType, path?: string): string | undefined => {
    if (type === PreviewType.COLLECTION)
        return 'https://cdnepgrafxstudioprd.azureedge.net/shared/assets/folder-padded.png';

    return path;
};

function ItemBrowser<
    T extends {
        id: string;
        type: MediaType;
        name: string;
        relativePath: string;
        extension: string | null;
    },
>(props: React.PropsWithChildren<ItemBrowserProps<T>>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isPanelOpen, connectorId, height, queryCall, previewCall, onSelect, convertToPreviewType } = props;
    const [breadcrumbStack, setBreadcrumbStack] = useState<string[]>([]);
    const [nextPageToken, setNextPageToken] = useState<{ token: string | null; requested: boolean }>({
        token: null,
        requested: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [list, setList] = useState<ItemCache<T>[]>([]);
    const [searchKeyWord, setSearchKeyWord] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const moreData = !!nextPageToken?.token;

    const {
        connectorCapabilities,
        contentType,
        imagePanelTitle,
        navigationStack,
        selectedItems,
        setNavigationStack,
        setSelectedItems,
    } = useVariablePanelContext();
    const isMobileSize = useMobileSize();

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
    }, [contentType]);

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
            if (contentType !== ContentType.IMAGE_PANEL) return;
            if (connectorCapabilities[connectorId]?.query) {
                const data = await queryCall(
                    connectorId,
                    {
                        collection: `/${navigationStack?.join('/') ?? ''}`,
                        pageToken: nextPageToken.token ? nextPageToken.token : '',
                        pageSize: 15,
                        filter: [searchQuery],
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
    }, [nextPageToken.requested, nextPageToken.token, contentType, searchQuery]);

    useEffect(() => {
        return () => {
            setSelectedItems([]);
            setNavigationStack([]);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle double clicking a item to unselect it.
    const selectItem = (item: T) => {
        // If item is already in the selectedItems, make filteredItems empty (this equals to the deselecting an item)
        const filteredItems = selectedItems.filter((i) => i.id === item.id).length === 0 ? [item] : [];
        // If the `selectedItems` is empty, just make one item array, otherwise pass in the `filteredItems`
        const items = selectedItems.length === 0 ? [item] : filteredItems;

        setSelectedItems(items as unknown as Media[]);
        if (onSelect) {
            onSelect(items);
        }
    };

    const getKey = useCallback((str: string, idx: number) => encodeURI(`${str},${idx}`), []);

    const formatRelativePath = (item: T) => {
        const { name, relativePath } = item;
        if (!relativePath) return '/';
        if (!relativePath.includes(name)) return relativePath + name;
        return relativePath;
    };

    const elements = list.map((listItem, idx) => {
        const itemType = convertToPreviewType(listItem.instance.type as unknown as AssetType);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const onClick = () => {
            if (itemType === PreviewType.COLLECTION) {
                setNavigationStack(() => {
                    setIsLoading(true);
                    return toNavigationStack(formatRelativePath(listItem.instance));
                });
                setBreadcrumbStack((currentStack) => [...currentStack, listItem.instance.name]);
            } else {
                selectItem(listItem.instance);
                setNavigationStack([]);
                setSearchQuery('');
                setSearchKeyWord('');
            }
        };

        return (
            <ChiliPreview
                key={getKey(
                    `${formatRelativePath(listItem.instance)}-${listItem.instance.name}-${listItem.instance.id}`,
                    idx,
                )}
                dataId={getDataIdForSUI(`media-card-preview-${listItem.instance.name}`)}
                dataTestId={getDataTestIdForSUI(`media-card-preview-${listItem.instance.name}`)}
                itemId={listItem.instance.id}
                name={listItem.instance.name}
                type={itemType as unknown as PreviewType}
                path={getPreviewThumbnail(itemType as unknown as PreviewType, formatRelativePath(listItem.instance))}
                metaData={
                    listItem?.instance?.extension?.toUpperCase() ?? (itemType?.replace('collection', 'Folder') || '')
                }
                renameItem={() => null}
                options={[]}
                padding="0rem"
                footerTopMargin="0.75rem"
                selected={selectedItems[0]?.id === listItem.instance.id}
                backgroundColor={Colors.LIGHT_GRAY}
                byteArray={
                    itemType === PreviewType.COLLECTION
                        ? undefined
                        : listItem.createOrGetDownloadPromise(() => previewCall(listItem.instance.id))
                }
                onClickCard={onClick}
                isModal={false}
                renamingDisabled
            />
        );
    });

    const breacrumbStackString = useMemo(() => {
        return breadcrumbStack?.join('\\') ?? '';
    }, [breadcrumbStack]);

    if (!isPanelOpen) {
        return null;
    }

    // eslint-disable-next-line no-nested-ternary
    const panelTitle = isMobileSize ? null : contentType === ContentType.IMAGE_PANEL ? imagePanelTitle : null;

    const handleSearch = (keyword: string) => {
        setSearchQuery(keyword);
        setNavigationStack([]);
        setBreadcrumbStack([]);
    };
    return (
        <Panel
            parentOverflow
            title={panelTitle}
            dataId={getDataIdForSUI('widget-media-panel')}
            dataTestId={getDataTestIdForSUI('widget-media-panel')}
            isModal={false}
            padding="0"
        >
            {connectorCapabilities[connectorId]?.filtering && (
                <SearchInputWrapper hasSearchQuery={!!searchQuery} isMobile={isMobileSize}>
                    <Input
                        type="text"
                        name="search"
                        placeholder="Search"
                        value={searchKeyWord}
                        onChange={(e) => setSearchKeyWord(e.target.value)}
                        onBlur={() => handleSearch(searchKeyWord)}
                        width="260px"
                        leftIcon={{
                            icon: (
                                <Icon
                                    editorComponent
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
            )}
            {!searchQuery && (
                <BreadCrumbsWrapper>
                    <BreadCrumb
                        href={`Home${breacrumbStackString.length ? '\\' : ''}${breacrumbStackString}`}
                        color={Colors.SECONDARY_FONT}
                        activeColor={Colors.PRIMARY_FONT}
                        onClick={(breadCrumb: string) => {
                            const newNavigationStack = navigationStack?.splice(
                                0,
                                navigationStack.indexOf(breadCrumb) + 1,
                            );
                            const newBreadcrumbStack = breadcrumbStack?.splice(
                                0,
                                breadcrumbStack.indexOf(breadCrumb) + 1,
                            );
                            setNavigationStack(newNavigationStack);
                            setBreadcrumbStack(newBreadcrumbStack);
                        }}
                    />
                </BreadCrumbsWrapper>
            )}
            <ScrollbarWrapper height={height ?? leftPanelHeight} scrollbarWidth="0">
                {elements.length === 0 && !isLoading && searchQuery && (
                    <EmptySearchResultContainer>
                        No search results found. Maybe try another keyword?
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
        </Panel>
    );
}

function toNavigationStack(path: string): string[] {
    return path.replaceAll('\\', '/').replace(/^\/+/, '').split('/');
}

export default ItemBrowser;
