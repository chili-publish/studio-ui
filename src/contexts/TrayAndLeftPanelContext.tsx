import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ImageVariableSourceType, Media } from '@chili-publish/studio-sdk';
import { ContentType, ITrayAndLeftPanelContext } from './TrayAndLeftPanelContext.types';
import { useVariableComponents } from '../components/variablesComponents/useVariablesComponents';

const TrayAndLeftPanelContextDefaultValues: ITrayAndLeftPanelContext = {
    showVariablesPanel: () => undefined,
    showImagePanel: () => undefined,
    contentType: ContentType.VARIABLES_LIST,
    currentVariableId: '',
    handleUpdateImage: () => undefined,
    selectedItems: [],
    navigationStack: [],
    setSelectedItems: () => undefined,
    setNavigationStack: () => undefined,
    previousPath: () => undefined,
};

export const TrayAndLeftPanelContext = createContext<ITrayAndLeftPanelContext>(TrayAndLeftPanelContextDefaultValues);

export const useTrayAndLeftPanelContext = () => {
    return useContext(TrayAndLeftPanelContext);
};

export function TrayAndLeftPanelContextProvider({ children }: { children: ReactNode }) {
    const [contentType, setContentType] = useState<ContentType>(ContentType.VARIABLES_LIST);
    const [currentVariableId, setCurrentVariableId] = useState<string>('');

    /* Image Panel Folder Navigation */
    const [selectedItems, setSelectedItems] = useState<Media[]>([]);
    const [navigationStack, setNavigationStack] = useState<string[]>([]);

    const { handleImageChange } = useVariableComponents(currentVariableId);

    const handleUpdateImage = useCallback(
        async (source: Media) => {
            await handleImageChange({
                assetId: source.id,
                connectorId: process.env.DEFAULT_MEDIA_CONNECTOR as string,
                sourceType: ImageVariableSourceType.mediaConnector,
            });
            setContentType(ContentType.VARIABLES_LIST);
        },
        [handleImageChange],
    );

    const previousPath = useCallback(() => {
        // We are removing any selected element from the state. This is because
        // for now we do not support multiselection.
        setSelectedItems([]);
        setNavigationStack((current) => current?.slice(0, -1));
    }, []);

    const data = useMemo(
        () => ({
            showVariablesPanel: () => setContentType(ContentType.VARIABLES_LIST),
            showImagePanel: (variableId: string) => {
                setCurrentVariableId(variableId);
                setContentType(ContentType.IMAGE_PANEL);
            },
            contentType,
            currentVariableId,
            handleUpdateImage,
            selectedItems,
            navigationStack,
            setSelectedItems,
            setNavigationStack,
            previousPath,
        }),
        [contentType, currentVariableId, handleUpdateImage, navigationStack, previousPath, selectedItems],
    );

    return <TrayAndLeftPanelContext.Provider value={data}>{children}</TrayAndLeftPanelContext.Provider>;
}
