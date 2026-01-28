import { Variable, VariableType } from '@chili-publish/studio-sdk';
import { useEffect, useState } from 'react';
import { GroupVariable as GroupVariableType } from './Variable.types';

const aggregateVariables = (variables: Variable[]): GroupVariableType[] => {
    const groups = new Map();
    const result: GroupVariableType[] = [];

    variables
        .filter((item) => item.isVisible)
        .forEach((item) => {
            const isGroup = item.type === VariableType.group;
            if (isGroup) {
                const group = { ...item, children: [] };
                groups.set(item.id, group);
                result.push(group);
            } else if (!isGroup && !item.parentId) {
                result.push(item);
            }
        });
    variables
        .filter((item) => item.isVisible && !!item.parentId)
        .forEach((item) => {
            if (groups.has(item.parentId)) groups.get(item.parentId).children.push(item);
        });

    return result || [];
};

const useGroupVariables = (variables: Variable[]) => {
    const [groupedVariables, setGroupedVariables] = useState<GroupVariableType[]>([]);

    useEffect(() => {
        const result = aggregateVariables(variables);
        setGroupedVariables(result);
    }, [variables]);

    return { groupedVariables };
};

export default useGroupVariables;
