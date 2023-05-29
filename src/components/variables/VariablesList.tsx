import { Variable } from '@chili-publish/studio-sdk';
import VariablesComponents from '../variablesComponents/VariablesComponents';

interface VariablesListProps {
    variables: Variable[];
}

function VariablesList({ variables }: VariablesListProps) {
    return (
        <div style={{ marginTop: '30px' }}>
            {variables.length > 0 &&
                variables.map((variable: Variable) => {
                    return (
                        <VariablesComponents
                            key={`variable-component-${variable.id}`}
                            type={variable.type}
                            variable={variable}
                        />
                    );
                })}
        </div>
    );
}

export default VariablesList;
