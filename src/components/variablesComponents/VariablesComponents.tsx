import { useMemo } from 'react';
// import { DropDown } from '@chili-publish/grafx-shared-components';
import {
    DateVariable as DateVariableType,
    NumberVariable as NumberVariableType,
    VariableType,
} from '@chili-publish/studio-sdk';
import { IVariablesComponents } from './VariablesComponents.types';
import { useVariableComponents } from './useVariablesComponents';
import ImageVariable from './imageVariable/ImageVariable';
import TextVariable from './TextVariable';
import BooleanVariable from './BooleanVariable';
import NumberVariable from './NumberVariable';
import DateVariable from './DateVariable';

function VariablesComponents(props: IVariablesComponents) {
    const { type, variable, isDocumentLoaded } = props;
    const { handleValueChange, handleImageRemove } = useVariableComponents(variable.id);

    const RenderComponents = useMemo(() => {
        switch (type) {
            case VariableType.longText:
            case VariableType.shortText: {
                return <TextVariable handleValueChange={handleValueChange} variable={variable} />;
            }

            case VariableType.image: {
                return isDocumentLoaded ? (
                    <ImageVariable variable={variable} handleImageRemove={handleImageRemove} />
                ) : null;
            }
            case VariableType.boolean: {
                return <BooleanVariable variable={variable} handleValueChange={handleValueChange} />;
            }
            case VariableType.number: {
                return (
                    variable.isVisible && (
                        <NumberVariable
                            variable={variable as NumberVariableType}
                            handleValueChange={handleValueChange}
                        />
                    )
                );
            }

            case VariableType.date: {
                return (
                    variable.isVisible && (
                        <DateVariable variable={variable as DateVariableType} handleValueChange={handleValueChange} />
                    )
                );
            }
            // This was temporarily hidden
            // case VariableType.group: {
            //     return <DropDown options={[]} />;
            // }
            default:
                return null;
        }
    }, [handleImageRemove, handleValueChange, type, variable, isDocumentLoaded]);

    return <div style={{ width: '100%' }}>{RenderComponents}</div>;
}

export default VariablesComponents;
