import { Variable, VariableType } from '@chili-publish/studio-sdk';
import styled from 'styled-components';
import useGroupVariables from './useGroupVariables';
import GroupVariable from './GroupVariable';

const GroupedVariablesWrapper = styled.div``;
const CollapseWrapper = styled.div<{ hasTopBorder?: boolean; hasBottomMargin?: boolean }>`
    border-bottom: 2px solid ${(props) => props.theme.panel.borderColor};
    border-top: ${(props) => (props.hasTopBorder ? `2px solid ${props.theme.panel.borderColor}` : 'none')};

    margin-left: -1.125rem;
    margin-right: -1.125rem;
    margin-bottom: ${(props) => (props.hasBottomMargin ? '0.5rem' : '0')};
    [data-id*='collapse-group'] {
        [data-id*='-header'],
        [data-id*='-body'] {
            padding: 0 1.25rem;
        }
    }
`;

function GroupVariablesList({
    variables,
    childrenListComponent,
}: {
    variables: Variable[];
    childrenListComponent: React.ComponentType<{ variables: Variable[] }>;
}) {
    const VariablesListComponent = childrenListComponent;
    const { groupedVariables } = useGroupVariables(variables);

    return (
        <>
            {groupedVariables.map((groupedVariable, index) => {
                const previousVariableIsGroup = groupedVariables[index - 1]?.type === VariableType.group;
                const currentVariableIsGroup = groupedVariable.type === VariableType.group;
                const nextVariableIsGroup = groupedVariables[index + 1]?.type === VariableType.group;
                return (
                    <GroupedVariablesWrapper key={`grouped-variable-${groupedVariable.id}`}>
                        {groupedVariable.type === VariableType.group && !!groupedVariable.children?.length && (
                            <CollapseWrapper
                                hasTopBorder={currentVariableIsGroup && !previousVariableIsGroup}
                                hasBottomMargin={!nextVariableIsGroup}
                            >
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
