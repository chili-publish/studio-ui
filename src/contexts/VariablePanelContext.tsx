import { AvailableIcons, Button, ButtonVariant, Colors, Icon } from '@chili-publish/grafx-shared-components';
import { ImageVariable, Media } from '@chili-publish/studio-sdk';
import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';
import { css } from 'styled-components';
import { NavigationTitle, NavigationWrapper } from '../components/itemBrowser/ItemBrowser.styles';
import { useVariableComponents } from '../components/variablesComponents/useVariablesComponents';
import { ContentType, ICapabilities, IConnectors, IVariablePanelContext } from './VariablePanelContext.types';

const VariablePanelContextDefaultValues: IVariablePanelContext = {
    showVariablesPanel: () => undefined,
    showImagePanel: () => undefined,
    contentType: ContentType.VARIABLES_LIST,
    currentVariableId: '',
    currentVariableConnectorId: '',
    handleUpdateImage: () => undefined,
    selectedItems: [],
    navigationStack: [],
    setSelectedItems: () => undefined,
    setNavigationStack: () => undefined,
    searchKeyWord: '',
    setSearchKeyWord: () => undefined,
    searchQuery: '',
    setSearchQuery: () => undefined,
    imagePanelTitle: <div />,
    connectorCapabilities: {},
    getCapabilitiesForConnector: async () => undefined,
};

export const VariablePanelContext = createContext<IVariablePanelContext>(VariablePanelContextDefaultValues);

export const useVariablePanelContext = () => {
    return useContext(VariablePanelContext);
};

export function VariablePanelContextProvider({
    children,
    connectors,
}: {
    children: ReactNode;
    connectors: IConnectors;
}) {
    const [contentType, setContentType] = useState<ContentType>(ContentType.VARIABLES_LIST);
    const [currentVariableId, setCurrentVariableId] = useState<string>('');
    const [currentVariableConnectorId, setCurrentVariableConnectorId] = useState<string>('');
    const [selectedItems, setSelectedItems] = useState<Media[]>([]);
    const [navigationStack, setNavigationStack] = useState<string[]>([]);
    const [searchKeyWord, setSearchKeyWord] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [connectorCapabilities, setConnectorCapabilities] = useState<ICapabilities>({});

    const getCapabilitiesForConnector = useCallback(async (connectorId: string) => {
        if (!connectorId) throw new Error('ConnectorId is not defined');
        const res = await window.SDK.mediaConnector.getCapabilities(connectorId);
        if (!res.parsedData) throw new Error('Connector capabilities are not defined');
        setConnectorCapabilities((prev) => {
            const t = {
                ...prev,
                [connectorId]: res.parsedData,
            } as ICapabilities;
            return t;
        });
    }, []);
    const { handleImageChange } = useVariableComponents(currentVariableId);

    const handleUpdateImage = useCallback(
        async (source: Media) => {
            await handleImageChange({
                assetId: source.id,
                connectorId: currentVariableConnectorId,
            });
            setContentType(ContentType.VARIABLES_LIST);
        },
        [currentVariableConnectorId, handleImageChange],
    );

    const imagePanelTitle = useMemo(
        () => (
            <NavigationWrapper>
                <Button
                    type="button"
                    variant={ButtonVariant.tertiary}
                    onClick={() => {
                        setContentType(ContentType.VARIABLES_LIST);
                        setNavigationStack([]);
                        setSearchKeyWord('');
                        setSearchQuery('');
                    }}
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
                <NavigationTitle className="navigation-path">Select image</NavigationTitle>
            </NavigationWrapper>
        ),
        [navigationStack],
    );

    const data = useMemo(
        () => ({
            showVariablesPanel: () => setContentType(ContentType.VARIABLES_LIST),
            showImagePanel: (variable: ImageVariable) => {
                setCurrentVariableId(variable.id);
                setCurrentVariableConnectorId(variable.value?.connectorId ?? '');
                setContentType(ContentType.IMAGE_PANEL);
            },
            contentType,
            currentVariableId,
            currentVariableConnectorId,
            handleUpdateImage,
            selectedItems,
            navigationStack,
            setSelectedItems,
            setNavigationStack,
            searchKeyWord,
            setSearchKeyWord,
            searchQuery,
            setSearchQuery,
            imagePanelTitle,
            connectorCapabilities,
            connectors,
            getCapabilitiesForConnector,
        }),
        [
            contentType,
            currentVariableId,
            currentVariableConnectorId,
            handleUpdateImage,
            selectedItems,
            navigationStack,
            searchKeyWord,
            searchQuery,
            imagePanelTitle,
            connectorCapabilities,
            connectors,
            getCapabilitiesForConnector,
        ],
    );

    return <VariablePanelContext.Provider value={data}>{children}</VariablePanelContext.Provider>;
}
