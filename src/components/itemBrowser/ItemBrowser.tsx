import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AvailableIcons,
    BreadCrumb,
    Button,
    ButtonVariant,
    PreviewCard as ChiliPreview,
    Colors,
    Icon,
    Panel,
    PreviewType,
    ScrollbarWrapper,
    useInfiniteScrolling,
} from '@chili-publish/grafx-shared-components';
import { MediaType, EditorResponse, MetaData, QueryOptions, QueryPage } from '@chili-publish/studio-sdk';
import {
    BreadCrumbsWrapper,
    LoadPageContainer,
    ModalResourcesContainer,
    NavigationTitle,
    NavigationWrapper,
    ResourcesContainer,
    ResourcesPreview,
} from './ItemBrowser.styles';
import { ItemCache } from './ItemCache';

type ItemBrowserProps<T extends { id: string }> = {
    isPanelOpen: boolean;
    connectorId: string;
    queryCall: (connector: string, options: QueryOptions, context: MetaData) => Promise<EditorResponse<QueryPage<T>>>;
    previewCall: (id: string) => Promise<Uint8Array>;
    convertToPreviewType: (input: string | number) => PreviewType;
    onSelect: (items: T[]) => void | null;
    isModal?: boolean;
    handleCloseModal?: () => void;
    showVariablesPanel: () => void;
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
    const {
        isPanelOpen,
        connectorId,
        queryCall,
        previewCall,
        onSelect,
        convertToPreviewType,
        isModal,
        handleCloseModal,
        showVariablesPanel,
    } = props;
    const [selectedItems, setSelectedItems] = useState<T[]>([]);
    const [navigationStack, setNavigationStack] = useState<string[]>();
    const [nextPageToken, setNextPageToken] = useState<{ token: string | null; requested: boolean }>({
        token: null,
        requested: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [list, setList] = useState<ItemCache<T>[]>([]);
    const moreData = !!nextPageToken?.token;

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
    }, [navigationStack]);

    // nextPagetoken is first set with 'requested: false' whenever we know the next
    // pagetoken. When the last item of the previous page comes into view (in html)
    // then we flip the requested to 'true' to trigger this effect.
    useEffect(() => {
        if (!nextPageToken.requested) return;
        setIsLoading(true);
        // declare the async data fetching function
        const fetchData = async () => {
            const data = await queryCall(
                connectorId,
                {
                    collection: `/${navigationStack?.join('/') ?? ''}`,
                    pageToken: nextPageToken.token ? nextPageToken.token : '',
                    pageSize: 15,
                },
                {},
            );
            // parse the token used if we need to fetch the next page
            if (data.success && data.parsedData && data.parsedData.data) {
                const token = data.parsedData.nextPageToken
                    ? new URL(data.parsedData.nextPageToken).searchParams.get('nextPageToken')
                    : null;
                setNextPageToken(() => {
                    return { token, requested: false };
                });
                setIsLoading(false);
                // convert to ItemCache to memoize the preview download call
                const itemsWithCache = data.parsedData.data.map((r: T) => new ItemCache<T>(r));
                setList((current) => [...current, ...itemsWithCache]);
            }
        };

        // call the function
        fetchData().catch(() => {
            setIsLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nextPageToken]);

    useEffect(() => {
        return () => {
            setSelectedItems([]);
        };
    }, []);

    // Handle double clicking a item to unselect it.
    const selectItem = (item: T) => {
        // If item is already in the selectedItems, make filteredItems empty (this equals to the deselecting an item)
        const filteredItems = selectedItems.filter((i) => i.id === item.id).length === 0 ? [item] : [];
        // If the `selectedItems` is empty, just make one item array, otherwise pass in the `filteredItems`
        const items = selectedItems.length === 0 ? [item] : filteredItems;

        setSelectedItems(items);
        if (onSelect) {
            onSelect(items);
        }
    };

    const previousPath = () => {
        // We are removing any selected element from the state. This is because
        // for now we do not support multiselection.
        setSelectedItems([]);
        if (onSelect) {
            onSelect([]);
        }
        setNavigationStack((current) => current?.slice(0, -1));
    };

    const getKey = useCallback((str: string, idx: number) => encodeURI(`${str},${idx}`), []);

    const generator = () => {
        return list.map((listItem, idx) => {
            const itemType = convertToPreviewType(listItem.instance.type);

            const onClick = () => {
                if (itemType === PreviewType.COLLECTION) {
                    setNavigationStack(() => toNavigationStack(listItem.instance.relativePath));
                } else {
                    selectItem(listItem.instance);
                }
            };

            const previewCard = (
                <ChiliPreview
                    key={listItem.instance.id}
                    dataId={`card-preview-${listItem.instance.name}`}
                    itemId={listItem.instance.id}
                    name={listItem.instance.name}
                    type={itemType as unknown as PreviewType}
                    path={listItem.instance.relativePath}
                    metaData={
                        listItem?.instance?.extension?.toUpperCase() ??
                        (itemType?.replace('collection', 'Folder') || '')
                    }
                    renameItem={() => null}
                    options={[]}
                    titleFontSize="0.813rem"
                    padding="0.75rem"
                    footerTopMargin="0.75rem"
                    selected={selectedItems[0]?.id === listItem.instance.id}
                    byteArray={
                        itemType === PreviewType.COLLECTION
                            ? undefined
                            : listItem.createOrGetDownloadPromise(() => previewCall(listItem.instance.id))
                    }
                    onClickCard={onClick}
                    isModal={isModal}
                />
            );
            return (
                <ResourcesPreview
                    width={isModal ? '25%' : undefined}
                    data-id={`resources-preview-${listItem.instance.name}`}
                    key={getKey(
                        `${listItem.instance.relativePath}-${listItem.instance.name}-${listItem.instance.id}`,
                        idx,
                    )}
                >
                    {previewCard}
                </ResourcesPreview>
            );
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    };

    const elements = generator();

    const navigationStackString = useMemo(() => {
        return navigationStack?.join('\\') ?? '';
    }, [navigationStack]);

    const panelTitle = (
        <NavigationWrapper>
            <Button
                type="button"
                variant={ButtonVariant.tertiary}
                onClick={(navigationStack ?? []).length ? previousPath : showVariablesPanel}
                icon={<Icon icon={AvailableIcons.faArrowLeft} />}
                styles={{ padding: '0' }}
            />
            <NavigationTitle className="navigation-path">Select Image</NavigationTitle>
            {isModal && handleCloseModal && <Icon icon="faXmark" className="close-icon" onClick={handleCloseModal} />}
        </NavigationWrapper>
    );

    if (!isPanelOpen) {
        return null;
    }

    return (
        <Panel parentOverflow={!isModal} title={panelTitle} dataId="widget-media-panel" isModal={isModal}>
            <BreadCrumbsWrapper>
                <BreadCrumb
                    href={navigationStackString}
                    color={Colors.SECONDARY_FONT}
                    activeColor={Colors.PRIMARY_FONT}
                    onClick={(test: string) => {
                        const newNavigationStack = navigationStack?.splice(0, navigationStack.indexOf(test) + 1);
                        setNavigationStack(newNavigationStack);
                    }}
                />
            </BreadCrumbsWrapper>
            {isModal ? (
                // We need to set height on the `ScrollbarWrapper` and `width` on it's child
                // to make scrollbar overlay work without content-shift
                <ScrollbarWrapper darkTheme height="22rem" invertScrollbarColors>
                    <ModalResourcesContainer width="45rem">
                        {elements}
                        <LoadPageContainer>
                            <div ref={infiniteScrollingRef} />
                        </LoadPageContainer>
                    </ModalResourcesContainer>
                </ScrollbarWrapper>
            ) : (
                <ScrollbarWrapper darkTheme height="100%" invertScrollbarColors>
                    <ResourcesContainer data-id="resources-container">
                        {elements}
                        <LoadPageContainer>
                            <div ref={infiniteScrollingRef} />
                        </LoadPageContainer>
                    </ResourcesContainer>
                </ScrollbarWrapper>
            )}
        </Panel>
    );
}

function toNavigationStack(path: string): string[] {
    return path.replaceAll('\\', '/').replace(/^\/+/, '').split('/');
}

export default ItemBrowser;
