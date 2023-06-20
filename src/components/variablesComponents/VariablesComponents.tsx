import { useMemo } from 'react';
import { DropDown } from '@chili-publish/grafx-shared-components';
import { VariableType } from '@chili-publish/studio-sdk';
import { IVariablesComponents } from './VariablesComponents.types';
import { useVariableComponents } from './useVariablesComponents';
import ImageVariable from './imageVariable/ImageVariable';
import TextVariable from './TextVariable';

function VariablesComponents(props: IVariablesComponents) {
    const { type, variable } = props;
    const { handleValueChange, handleImageRemove } = useVariableComponents(variable.id);

    const RenderComponents = useMemo(() => {
        switch (type) {
            case VariableType.longText:
            case VariableType.shortText: {
                return <TextVariable handleValueChange={handleValueChange} variable={variable} />;
            }

            case VariableType.image: {
                return (
                    <ImageVariable
                        variable={variable}
                        handleImageRemove={handleImageRemove}
                        // TODO: uncomment when assets browser is integrated
                    />
                );
            }
            case VariableType.group: {
                return <DropDown options={[]} />;
            }
            default:
                return null;
        }
    }, [handleImageRemove, handleValueChange, type, variable]);

    return <div style={{ width: '100%', marginBottom: '1rem' }}>{RenderComponents}</div>;
}

export default VariablesComponents;
