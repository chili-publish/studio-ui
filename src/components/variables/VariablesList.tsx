import { Variable } from '@chili-publish/studio-sdk';
import VariablesComponents from '../variablesComponents/VariablesComponents';
import { VariablesPanelHeader } from './VariablesPanel.styles';
import useMobileSize from '../../hooks/useMobileSize';

interface VariablesListProps {
    variables: Variable[];
}

function VariablesList({ variables }: VariablesListProps) {
    const isMobileSize = useMobileSize();
    return (
        <>
            {!isMobileSize && <VariablesPanelHeader>Customize</VariablesPanelHeader>}
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
        </>
    );
}

export default VariablesList;
