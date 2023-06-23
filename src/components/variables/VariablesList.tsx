import { Variable } from '@chili-publish/studio-sdk';
import VariablesComponents from '../variablesComponents/VariablesComponents';
import { VariablesPanelTitle } from './VariablesPanel.styles';
import useMobileSize from '../../hooks/useMobileSize';

interface VariablesListProps {
    variables: Variable[];
}

function VariablesList({ variables }: VariablesListProps) {
    const isMobileSize = useMobileSize();
    return (
        <>
            {!isMobileSize && <VariablesPanelTitle>Customize</VariablesPanelTitle>}
            {variables.length > 0 &&
                variables.map((variable: Variable) => {
                    const { isVisible } = variable;
                    return isVisible ? (
                        <VariablesComponents
                            key={`variable-component-${variable.id}`}
                            type={variable.type}
                            variable={variable}
                        />
                    ) : null;
                })}
        </>
    );
}

export default VariablesList;
