import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ConnectorInstance, ConnectorRegistrationSource, ImageVariable, Media } from '@chili-publish/studio-sdk';
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
    currentVariableConnectorId: '',
    handleUpdateImage: () => undefined,
    selectedItems: [],
    navigationStack: [],
    setSelectedItems: () => undefined,
    setNavigationStack: () => undefined,
    imagePanelTitle: <div />,
    defaultMediaConnector: {
        id: '',
        name: '',
        iconUrl: '',
        source: { source: ConnectorRegistrationSource.grafx, url: '' },
    },
    defaultFontsConnector: {
        id: '',
        name: '',
        iconUrl: '',
        source: { source: ConnectorRegistrationSource.grafx, url: '' },
    },
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
    /* Connectors */
    const [mediaConnectors, setMediaConnectors] = useState<ConnectorInstance[]>(connectors.mediaConnectors);
    const [fontsConnectors, setFontsConnectors] = useState<ConnectorInstance[]>(connectors.fontsConnectors);
    const [defaultMediaConnector, setDefaultMediaConnector] = useState<ConnectorInstance>({
        id: '',
        name: '',
        iconUrl: '',
        source: { source: ConnectorRegistrationSource.grafx, url: '' },
    });
    const [defaultFontsConnector, setDefaultFontsConnector] = useState<ConnectorInstance>({
        id: '',
        name: '',
        iconUrl: '',
        source: { source: ConnectorRegistrationSource.grafx, url: '' },
    });
    /* Image Panel Folder Navigation */
    const [selectedItems, setSelectedItems] = useState<Media[]>([]);
    const [navigationStack, setNavigationStack] = useState<string[]>([]);

    const [connectorCapabilities, setConnectorCapabilities] = useState<ICapabilities>({});
    const getCapabilitiesForConnector = useCallback(
        async (connectorId: string) => {
            if (!connectorId) return;
            const res = await window.SDK.mediaConnector.getCapabilities(connectorId);
            if (!res.parsedData) return;
            setConnectorCapabilities((prev) => {
                return {
                    ...prev,
                    [connectorId]: res.parsedData,
                } as ICapabilities;
            });
        },
        [setConnectorCapabilities],
    );

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

    /* Get default connector capabilities */
    useEffect(() => {
        const getCapabilitiesForDefaultConnectors = async () => {
            await getCapabilitiesForConnector(defaultMediaConnector?.id);
            await getCapabilitiesForConnector(defaultFontsConnector?.id);
        };
        getCapabilitiesForDefaultConnectors();
    }, [defaultFontsConnector?.id, defaultMediaConnector?.id, getCapabilitiesForConnector]);

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
            imagePanelTitle,
            defaultMediaConnector,
            defaultFontsConnector,
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
            imagePanelTitle,
            defaultMediaConnector,
            defaultFontsConnector,
            connectorCapabilities,
            connectors,
            getCapabilitiesForConnector,
        ],
    );

    return <VariablePanelContext.Provider value={data}>{children}</VariablePanelContext.Provider>;
}
