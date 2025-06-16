import { AvailableIcons, Button, ButtonVariant, Icon } from '@chili-publish/grafx-shared-components';
import { DateVariable, ImageVariable, Media, Variable } from '@chili-publish/studio-sdk';
import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';
import { css } from 'styled-components';
import { useDirection } from 'src/hooks/useDirection';
import { NavigationTitle, NavigationWrapper } from '../components/itemBrowser/ItemBrowser.styles';
import { useVariableComponents } from '../components/variablesComponents/useVariablesComponents';
import { ContentType, ICapabilities, IVariablePanelContext } from './VariablePanelContext.types';
import { useVariableValidation } from './useVariableValidation';

const VariablePanelContextDefaultValues: IVariablePanelContext = {
    showVariablesPanel: () => undefined,
    showDatePicker: () => undefined,
    showImagePanel: () => undefined,
    showDataSourcePanel: () => undefined,
    variablesValidation: {},
    validateVariables: () => false,
    validateUpdatedVariables: () => false,
    validateVariable: () => undefined,
    getVariableError: () => '',
    contentType: ContentType.DEFAULT,
    currentVariableId: '',
    currentVariableConnectorId: '',
    handleUpdateImage: () => Promise.resolve(),
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

export function VariablePanelContextProvider({ children, variables }: { children: ReactNode; variables: Variable[] }) {
    const { direction } = useDirection();
    const [contentType, setContentType] = useState<ContentType>(ContentType.DEFAULT);
    const [currentVariableId, setCurrentVariableId] = useState<string>('');
    const [currentVariableConnectorId, setCurrentVariableConnectorId] = useState<string>('');
    const [selectedItems, setSelectedItems] = useState<Media[]>([]);
    const [navigationStack, setNavigationStack] = useState<string[]>([]);
    const [searchKeyWord, setSearchKeyWord] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [connectorCapabilities, setConnectorCapabilities] = useState<ICapabilities>({});

    const variableValidationData = useVariableValidation(variables);

    const getCapabilitiesForConnector = useCallback(async (connectorId: string) => {
        if (!connectorId) throw new Error('ConnectorId is not defined');
        const res = await window.StudioUISDK.mediaConnector.getCapabilities(connectorId);
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
            setContentType(ContentType.DEFAULT);
            const imgSrc = {
                assetId: source.id,
                connectorId: currentVariableConnectorId,
            };
            await handleImageChange(imgSrc);
            const variable = variables.find((item) => item.id === currentVariableId) as ImageVariable | undefined;
            if (variable)
                variableValidationData.validateVariable({
                    ...variable,
                    value: { ...variable.value, ...imgSrc },
                } as ImageVariable);
        },
        [currentVariableConnectorId, handleImageChange, currentVariableId, variableValidationData, variables],
    );

    const imagePanelTitle = useMemo(
        () => (
            <NavigationWrapper>
                <Button
                    type="button"
                    variant={ButtonVariant.tertiary}
                    onClick={() => {
                        setContentType(ContentType.DEFAULT);
                        setNavigationStack([]);
                        setSearchKeyWord('');
                        setSearchQuery('');
                    }}
                    icon={
                        <Icon
                            key={navigationStack.length}
                            icon={direction === 'rtl' ? AvailableIcons.faArrowRight : AvailableIcons.faArrowLeft}
                        />
                    }
                    styles={css`
                        padding: 0;
                    `}
                />
                <NavigationTitle className="navigation-path">Select image</NavigationTitle>
            </NavigationWrapper>
        ),
        [direction, navigationStack],
    );

    const data = useMemo(
        () => ({
            showVariablesPanel: () => {
                setContentType(ContentType.DEFAULT);
            },
            showDatePicker: (variable: DateVariable) => {
                setContentType(ContentType.DATE_VARIABLE_PICKER);
                setCurrentVariableId(variable.id);
            },
            showImagePanel: (variable: ImageVariable) => {
                setCurrentVariableId(variable.id);
                setCurrentVariableConnectorId(variable.value?.connectorId ?? '');
                setContentType(ContentType.IMAGE_PANEL);
            },
            showDataSourcePanel: () => {
                setContentType(ContentType.DATA_SOURCE_TABLE);
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
            getCapabilitiesForConnector,
            ...variableValidationData,
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
            getCapabilitiesForConnector,
            variableValidationData,
        ],
    );

    return <VariablePanelContext.Provider value={data}>{children}</VariablePanelContext.Provider>;
}
