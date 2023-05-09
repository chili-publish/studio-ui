import { ChangeEvent, useMemo, useState } from 'react';
import { DropDown, ImagePicker, Label, TextField } from '@chili-publish/grafx-shared-components';
import { LongTextVariable, Media, MediaDownloadType, ShortTextVariable, VariableType } from '@chili-publish/editor-sdk';
import { IVariablesComponents } from './VariableComponent.types';
import { useVariableComponents } from './useVariableComponent';
import { usePreviewImages } from './usePreviewImage';
import { VariableContainer } from './VariableComponent.styles';

const DEFAULT_MEDIA_CONNECTOR = 'grafx-media';
const PREVIEW_ERROR_URL = 'https://cdnepgrafxstudioprd.azureedge.net/shared/assets/preview-fallback-padded.svg';

function VariableComponent(props: IVariablesComponents) {
    const { type, variable } = props;
    const { handleValueChange, handleImageRemove } = useVariableComponents(variable.id);
    const [selectedImage] = useState<Media>();
    const previewCall = (id: string): Promise<Uint8Array> =>
        window.SDK.mediaConnector.download(DEFAULT_MEDIA_CONNECTOR, id, MediaDownloadType.LowResolutionWeb, {});

    const { currentPreviewImage } = usePreviewImages(
        DEFAULT_MEDIA_CONNECTOR,
        PREVIEW_ERROR_URL,
        true,
        previewCall,
        selectedImage,
        variable,
    );

    const [variableValue, setVariableValue] = useState(
        (variable as ShortTextVariable).value || (variable as LongTextVariable).value,
    );

    const RenderComponents = useMemo(() => {
        switch (type) {
            case VariableType.longtext:
            case VariableType.shorttext: {
                const handleVariableChange = (e: ChangeEvent<HTMLInputElement>) => {
                    setVariableValue(e.target.value);
                };
                return (
                    <VariableContainer>
                        <TextField
                            value={variableValue}
                            onChange={handleVariableChange}
                            onBlur={(event: ChangeEvent<HTMLInputElement>) => handleValueChange(event.target.value)}
                            name={variable.id}
                            label={<Label translationKey={variable?.name ?? ''} value={variable?.name ?? ''} />}
                        />
                    </VariableContainer>
                );
            }

            case VariableType.image: {
                return (
                    <ImagePicker
                        name={variable.id}
                        label={<Label translationKey={variable?.name ?? ''} value={variable?.name ?? ''} />}
                        previewImage={currentPreviewImage}
                        onRemove={handleImageRemove}
                        // TODO: replace with the action that opens the assets panel
                        // eslint-disable-next-line no-console
                        onClick={() => console.log('open assets panel')}
                        previewErrorUrl={PREVIEW_ERROR_URL}
                    />
                );
            }
            case VariableType.group: {
                return <DropDown options={[]} />;
            }
            default:
                return null;
        }
    }, [currentPreviewImage, handleImageRemove, handleValueChange, type, variable.id, variable.name, variableValue]);

    return <div style={{ width: '100%', marginBottom: '1rem' }}>{RenderComponents}</div>;
}

export default VariableComponent;
