import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ConnectorInstance, Media } from '@chili-publish/studio-sdk';
import { Button, ButtonVariant, Icon, AvailableIcons, Colors } from '@chili-publish/grafx-shared-components';
import { css } from 'styled-components';
import { useVariableComponents } from '../components/variablesComponents/useVariablesComponents';
import { NavigationWrapper, NavigationTitle } from '../components/itemBrowser/ItemBrowser.styles';
import { ContentType, ICapabilities, IConnectors, IVariablePanelContext } from './VariablePanelContext.types';

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
    imagePanelTitle: <div />,
    defaultFontsConnector: { id: '', iconUrl: '', name: '' },
    defaultMediaConnector: { id: '', iconUrl: '', name: '' },
    connectorCapabilities: {},
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
    const [mediaConnectors, setMediaConnectors] = useState<ConnectorInstance[]>(connectors.mediaConnectors);
    const [fontsConnectors, setFontsConnectors] = useState<ConnectorInstance[]>(connectors.fontsConnectors);
    const [defaultMediaConnector, setDefaultMediaConnector] = useState<ConnectorInstance>({
        id: '',
        iconUrl: '',
        name: '',
    });
    const [defaultFontsConnector, setDefaultFontsConnector] = useState<ConnectorInstance>({
        id: '',
        iconUrl: '',
        name: '',
    });

    const [connectorCapabilities, setConnectorCapabilities] = useState<ICapabilities>({});
    /* Image Panel Folder Navigation */
    const [selectedItems, setSelectedItems] = useState<Media[]>([]);
    const [navigationStack, setNavigationStack] = useState<string[]>([]);
    useEffect(() => {
        setMediaConnectors(connectors.mediaConnectors);
    }, [connectors.mediaConnectors]);

    useEffect(() => {
        setFontsConnectors(connectors.fontsConnectors);
    }, [connectors.fontsConnectors]);

    useEffect(() => {
        if (mediaConnectors) setDefaultMediaConnector(mediaConnectors[0]);
    }, [mediaConnectors]);

    useEffect(() => {
        if (fontsConnectors) setDefaultFontsConnector(fontsConnectors[0]);
    }, [fontsConnectors]);

    useEffect(() => {
        const getCapabilities = async () => {
            if (defaultMediaConnector?.id) {
                await window.SDK.mediaConnector.getCapabilities(defaultMediaConnector.id).then((res) => {
                    if (res.parsedData)
                        setConnectorCapabilities((prev) => {
                            return {
                                ...prev,
                                [defaultMediaConnector.id]: res.parsedData,
                            } as ICapabilities;
                        });
                });
            }
            if (defaultFontsConnector?.id) {
                await window.SDK.fontConnector.getCapabilities(defaultFontsConnector.id).then((res) => {
                    if (res.parsedData)
                        setConnectorCapabilities((prev) => {
                            return {
                                ...prev,
                                [defaultFontsConnector.id]: res.parsedData,
                            } as ICapabilities;
                        });
                });
            }
        };
        getCapabilities();
    }, [defaultFontsConnector?.id, defaultMediaConnector?.id]);

    const { handleImageChange } = useVariableComponents(currentVariableId);

    const handleUpdateImage = useCallback(
        async (source: Media) => {
            await handleImageChange({
                assetId: source.id,
                connectorId: defaultMediaConnector?.id,
            });
            setContentType(ContentType.VARIABLES_LIST);
        },
        [defaultMediaConnector?.id, handleImageChange],
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
            imagePanelTitle,
            defaultMediaConnector,
            defaultFontsConnector,
            connectorCapabilities,
            connectors,
        }),
        [
            contentType,
            currentVariableId,
            handleUpdateImage,
            selectedItems,
            navigationStack,
            imagePanelTitle,
            defaultMediaConnector,
            defaultFontsConnector,
            connectorCapabilities,
            connectors,
        ],
    );

    return <VariablePanelContext.Provider value={data}>{children}</VariablePanelContext.Provider>;
}
