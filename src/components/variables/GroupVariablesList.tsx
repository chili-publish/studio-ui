import { Variable, VariableType } from '@chili-publish/studio-sdk';
import styled from 'styled-components';
import useGroupVariables from './useGroupVariables';
import GroupVariable from './GroupVariable';
import FlatVariablesList from './FlatVariablesList';

const GroupedVariablesWrapper = styled.div<{ hasBottomMargin?: boolean }>`
    margin-bottom: ${(props) => (props.hasBottomMargin ? '0.5rem' : '0')};
`;
const CollapseWrapper = styled.div<{ hasTopBorder?: boolean }>`
    border-bottom: 2px solid ${(props) => props.theme.panel.borderColor};
    border-top: ${(props) => (props.hasTopBorder ? `2px solid ${props.theme.panel.borderColor}` : 'none')};

    margin-left: -1.125rem;
    margin-right: -1.125rem;
    [data-id*='collapse-group'] {
        [data-id*='-header'],
        [data-id*='-body'] {
            padding: 0 1.25rem;
        }
    }
`;

function GroupVariablesList({
    variables,
    groupChildren,
}: {
    variables: Variable[];
    groupChildren: React.ComponentType<{ variables: Variable[] }>;
}) {
    const VariablesListComponent = groupChildren;
    const { groupedVariables } = useGroupVariables(variables);

    return (
        <>
            {groupedVariables.map((groupedVariable, index) => {
                const previousVariableIsGroup = groupedVariables[index - 1]?.type === VariableType.group;
                const currentVariableIsGroup = groupedVariable.type === VariableType.group;
                const nextVariableIsGroup = groupedVariables[index + 1]?.type === VariableType.group;
                return (
                    <GroupedVariablesWrapper
                        key={`grouped-variable-${groupedVariable.id}`}
                        hasBottomMargin={!nextVariableIsGroup || !currentVariableIsGroup}
                    >
                        {groupedVariable.type === VariableType.group && !!groupedVariable.children?.length && (
                            <CollapseWrapper hasTopBorder={currentVariableIsGroup && !previousVariableIsGroup}>
                                <GroupVariable groupVariable={groupedVariable}>
                                    <VariablesListComponent variables={groupedVariable.children || []} />
                                </GroupVariable>
                            </CollapseWrapper>
                        )}
                        {groupedVariable.type !== VariableType.group && (
                            <VariablesListComponent variables={[groupedVariable]} />
                        )}
                    </GroupedVariablesWrapper>
                );
            })}
        </>
    );
}

export default GroupVariablesList;
