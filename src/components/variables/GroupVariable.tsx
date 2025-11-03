import { Collapse, InputLabel } from '@chili-publish/grafx-shared-components';
import { useState } from 'react';
import { getDataIdForSUI, getDataTestIdForSUI } from 'src/utils/dataIds';
import { VariablesWrapper } from './VariablesPanel.styles';
import { CollapseContent } from './GroupVariables.style';
import { GroupVariable as GroupVariableType } from './Variable.types';

interface GroupVariableProps {
    groupVariable: GroupVariableType;
    children: React.ReactNode;
}
function GroupVariable({ groupVariable, children }: GroupVariableProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Collapse
            isOpen={isOpen}
            onToggle={() => setIsOpen(!isOpen)}
            title={{
                key: groupVariable.label ?? groupVariable.name,
                value: groupVariable.label ?? groupVariable.name,
            }}
            dataId={getDataIdForSUI(`collapse-group-${groupVariable.id}`)}
            dataTestId={getDataTestIdForSUI(`collapse-group-${groupVariable.id}`)}
        >
            {isOpen && (
                <CollapseContent>
                    {groupVariable.helpText && (
                        <InputLabel labelFor={groupVariable.id} label={groupVariable.helpText} />
                    )}
                    <VariablesWrapper>{children}</VariablesWrapper>
                </CollapseContent>
            )}
        </Collapse>
    );
}

export default GroupVariable;
