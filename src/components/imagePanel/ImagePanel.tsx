import { ImageVariable, Media, MediaDownloadType, MetaData, QueryOptions } from '@chili-publish/studio-sdk';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { convertToPreviewType } from '../../utils/mediaUtils';
import ItemBrowser from '../itemBrowser/ItemBrowser';
import { useUiConfigContext } from '../../contexts/UiConfigContext';
import { showVariablesPanel } from '../../store/reducers/panelReducer';
import { useAppDispatch } from '../../store';
import {
    selectCurrentVariableConnectorId,
    selectCurrentVariableId,
    selectVariables,
    setImageChangePendingId,
    validateVariable,
} from '../../store/reducers/variableReducer';
import { useVariableComponents } from '../variablesComponents/useVariablesComponents';
import { SEARCH_IN_UPLOAD_FOLDER_FIELD_NAME } from '../../utils/constants';

function ImagePanel() {
    const dispatch = useAppDispatch();

    const currentVariableId = useSelector(selectCurrentVariableId);
    const currentVariableConnectorId = useSelector(selectCurrentVariableConnectorId);
    const variables = useSelector(selectVariables);

    const { handleImageChange } = useVariableComponents(currentVariableId);
    const { onVariableBlur } = useUiConfigContext();

    const previewCall = (id: string): Promise<Uint8Array> =>
        window.StudioUISDK.mediaConnector.download(currentVariableConnectorId, id, MediaDownloadType.mediumres, {});

    const updateValueForVariable = useCallback(
        async (source: Media, variable: ImageVariable) => {
            const imgSrc = {
                assetId: source.id,
                connectorId: currentVariableConnectorId,
                context: { searchInUploadFolder: false },
            };

            await handleImageChange(imgSrc);
            return { ...variable, value: { ...variable.value, ...imgSrc } };
        },
        [currentVariableConnectorId, handleImageChange],
    );

    const handleAssetSelection = useCallback(
        async (asset: Media) => {
            const variable = variables.find((item) => item.id === currentVariableId) as ImageVariable;

            if (variable.value?.assetId !== asset.id) {
                dispatch(setImageChangePendingId(currentVariableId));
            }
            dispatch(showVariablesPanel());
            const updatedVariable = await updateValueForVariable(asset, variable);
            dispatch(validateVariable(updatedVariable));
            onVariableBlur?.(currentVariableId);
        },
        [updateValueForVariable, onVariableBlur, currentVariableId, variables, dispatch],
    );

    const queryCall = useCallback(async (connectorId: string, options: QueryOptions, context: MetaData) => {
        return window.StudioUISDK.mediaConnector.query(connectorId, options, {
            ...context,
            [SEARCH_IN_UPLOAD_FOLDER_FIELD_NAME]: false,
        });
    }, []);

    if (!currentVariableConnectorId) return null;

    return (
        <ItemBrowser<Media>
            isPanelOpen
            connectorId={currentVariableConnectorId}
            queryCall={queryCall}
            previewCall={previewCall}
            onSelect={handleAssetSelection}
            convertToPreviewType={convertToPreviewType}
        />
    );
}

export default ImagePanel;
