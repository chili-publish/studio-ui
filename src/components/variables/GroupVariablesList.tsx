import { Variable, VariableType } from '@chili-publish/studio-sdk';
import { getDataIdForSUI, getDataTestIdForSUI } from 'src/utils/dataIds';
import useGroupVariables from './useGroupVariables';
import GroupVariable from './GroupVariable';
import { CollapseWrapper, GroupedVariablesWrapper } from './GroupVariables.style';

const GroupVariablesList = ({
    variables,
    childrenListComponent,
}: {
    variables: Variable[];
    childrenListComponent: React.ComponentType<{ variables: Variable[] }>;
}) => {
    const VariablesListComponent = childrenListComponent;
    const { groupedVariables } = useGroupVariables(variables);

    return (
        <>
            {groupedVariables.map((groupedVariable, index) => {
                const previousVariableIsGroup = groupedVariables[index - 1]?.type === VariableType.group;
                const currentVariableIsGroup = groupedVariable.type === VariableType.group;
                const nextVariableIsGroup = groupedVariables[index + 1]?.type === VariableType.group;
                if (groupedVariable.type === VariableType.group && !groupedVariable.children?.length) return null;
                return (
                    <GroupedVariablesWrapper
                        key={`grouped-variable-${groupedVariable.id}`}
                        data-id={getDataIdForSUI(`variable-wrapper-${groupedVariable.id}`)}
                        data-testid={getDataTestIdForSUI(`variable-wrapper-${groupedVariable.id}`)}
                    >
                        {groupedVariable.type === VariableType.group && !!groupedVariable.children?.length && (
                            <CollapseWrapper
                                hasTopBorder={currentVariableIsGroup && !previousVariableIsGroup}
                                hasBottomMargin={!nextVariableIsGroup}
                            >
                                <GroupVariable groupVariable={groupedVariable}>
                                    <VariablesListComponent variables={groupedVariable.children} />
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
};

export default GroupVariablesList;
