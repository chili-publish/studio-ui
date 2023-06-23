import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ImageVariableSourceType, Media } from '@chili-publish/studio-sdk';
import { Button, ButtonVariant, Icon, AvailableIcons, Colors } from '@chili-publish/grafx-shared-components';
import { css } from 'styled-components';
import { useVariableComponents } from '../components/variablesComponents/useVariablesComponents';
import { NavigationWrapper, NavigationTitle } from '../components/itemBrowser/ItemBrowser.styles';
import { ContentType, IVariablePanelContext } from './VariablePanelContext.types';

const VariablePanelContextDefaultValues: IVariablePanelContext = {
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
    imagePanelTitle: <div />,
};

export const VariablePanelContext = createContext<IVariablePanelContext>(VariablePanelContextDefaultValues);

export const useVariablePanelContext = () => {
    return useContext(VariablePanelContext);
};

export function VariablePanelContextProvider({ children }: { children: ReactNode }) {
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
                id: process.env.DEFAULT_MEDIA_CONNECTOR as string,
                type: ImageVariableSourceType.mediaConnector,
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

    const imagePanelTitle = useMemo(
        () => (
            <NavigationWrapper>
                <Button
                    type="button"
                    variant={ButtonVariant.tertiary}
                    onClick={
                        (navigationStack ?? []).length ? previousPath : () => setContentType(ContentType.VARIABLES_LIST)
                    }
                    icon={
                        <Icon
                            key={navigationStack.length}
                            icon={AvailableIcons.faArrowLeft}
                            color={Colors.PRIMARY_FONT}
                        />
                    }
                    styles={css`
                        padding: 0;
                    `}
                />
                <NavigationTitle className="navigation-path">Select Image</NavigationTitle>
            </NavigationWrapper>
        ),
        [navigationStack, previousPath],
    );

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
            imagePanelTitle,
        }),
        [
            contentType,
            currentVariableId,
            handleUpdateImage,
            navigationStack,
            imagePanelTitle,
            previousPath,
            selectedItems,
        ],
    );

    return <VariablePanelContext.Provider value={data}>{children}</VariablePanelContext.Provider>;
}