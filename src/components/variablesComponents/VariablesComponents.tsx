import { useMemo } from 'react';
import { DropDown } from '@chili-publish/grafx-shared-components';
import { ListVariable, Variable, VariableType } from '@chili-publish/studio-sdk';
import { IVariablesComponents } from './VariablesComponents.types';
import { useVariableComponents } from './useVariablesComponents';
import ImageVariable from './imageVariable/ImageVariable';
import TextVariable from './TextVariable';

const isListVariable = (variable: Variable): variable is ListVariable => variable.type === VariableType.list;

function VariablesComponents(props: IVariablesComponents) {
    const { type, variable } = props;
    const { handleValueChange, handleImageRemove, handleListValueChange } = useVariableComponents(variable.id);

    const RenderComponents = useMemo(() => {
        switch (type) {
            case VariableType.longtext:
            case VariableType.shorttext: {
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
            case VariableType.list: {
                if (isListVariable(variable)) {
                    const options = variable.items.map((item) => ({ label: item, value: item }));
                    const selectedValue = variable.selected
                        ? { label: variable.selected, value: variable.selected }
                        : undefined;
                    return (
                        <DropDown
                            value={selectedValue}
                            options={options}
                            onChange={(val) => handleListValueChange(val?.value?.toString() || '')}
                            width="100%"
                            isSearchable={false}
                        />
                    );
                }
                return null;
            }
            default:
                return null;
        }
    }, [handleImageRemove, handleValueChange, handleListValueChange, type, variable]);

    return <div style={{ width: '100%', marginBottom: '1rem' }}>{RenderComponents}</div>;
}

export default VariablesComponents;
