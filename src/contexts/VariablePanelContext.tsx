import { AvailableIcons, Button, ButtonVariant, Icon } from '@chili-publish/grafx-shared-components';
import { ImageVariable, Media, Variable } from '@chili-publish/studio-sdk';
import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';
import { css } from 'styled-components';
import { useSelector } from 'react-redux';
import { NavigationTitle, NavigationWrapper } from '../components/itemBrowser/ItemBrowser.styles';
import { useVariableComponents } from '../components/variablesComponents/useVariablesComponents';
import { ICapabilities, IVariablePanelContext } from './VariablePanelContext.types';
import { useVariableValidation } from './useVariableValidation';
import {
    selectCurrentVariableConnectorId,
    selectCurrentVariableId,
    showVariablesPanel,
} from '../store/reducers/panelReducer';
import { useAppDispatch } from '../store';

const VariablePanelContextDefaultValues: IVariablePanelContext = {
    variablesValidation: {},
    validateVariables: () => false,
    validateUpdatedVariables: () => false,
    validateVariable: () => undefined,
    getVariableError: () => '',

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
    const dispatch = useAppDispatch();
    const currentVariableId = useSelector(selectCurrentVariableId);
    const currentVariableConnectorId = useSelector(selectCurrentVariableConnectorId);

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
            dispatch(showVariablesPanel());
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
        [currentVariableConnectorId, handleImageChange, currentVariableId, variableValidationData, variables, dispatch],
    );

    const imagePanelTitle = useMemo(
        () => (
            <NavigationWrapper>
                <Button
                    type="button"
                    variant={ButtonVariant.tertiary}
                    onClick={() => {
                        dispatch(showVariablesPanel());
                        setNavigationStack([]);
                        setSearchKeyWord('');
                        setSearchQuery('');
                    }}
                    icon={<Icon key={navigationStack.length} icon={AvailableIcons.faArrowLeft} />}
                    styles={css`
                        padding: 0;
                    `}
                />
                <NavigationTitle className="navigation-path">Select image</NavigationTitle>
            </NavigationWrapper>
        ),
        [navigationStack, dispatch],
    );

    const data = useMemo(
        () => ({
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
