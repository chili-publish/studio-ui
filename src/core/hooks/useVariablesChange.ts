import { Variable } from '@chili-publish/studio-sdk';
import { useEffect, useState } from 'react';
import { useSubscriberContext } from '../../contexts/Subscriber';

/**
 * Use this hook when you want to listen only particular variable's changes
 *
 * @param variableIds Array of variables ids on which changes you want to subscribe
 * @returns The most recent values of the variables you are monitoring for updates.
 */
export function useVariablesChange(variableIds: Array<string>) {
    const [variables, setVariables] = useState<Record<string, Variable>>({});
    const { subscriber } = useSubscriberContext();

    useEffect(() => {
        (async () => {
            const { parsedData: documentVariables } = await window.StudioUISDK.variable.getAll();
            if (!documentVariables || variableIds.length === 0) {
                return;
            }
            const variablesChangeToListen = documentVariables
                .filter((v) => variableIds.includes(v.id))
                .reduce(
                    (all, vm) => {
                        all[vm.id] = vm;
                        return all;
                    },
                    {} as Record<string, Variable>,
                );
            // If we receive such condition as "true", it means the size of variable's list is dynamic
            // and we need to adjust the behavior - not a case right now
            if (variableIds.length !== Object.keys(variablesChangeToListen).length) {
                // eslint-disable-next-line no-console
                console.warn('Variables list is not loaded properly');
            } else {
                setVariables(variablesChangeToListen);
            }
        })();
    }, [variableIds]);

    useEffect(() => {
        const handler = (event: Variable[]) => {
            // To aggregate multiple variable updates into a single change
            const changedVariables = event.filter((v) => {
                if (variables[v.id] && JSON.stringify(variables[v.id]) !== JSON.stringify(v)) {
                    return v;
                }
                return false;
            });
            changedVariables.forEach((cv) => setVariables((prev) => ({ ...prev, [cv.id]: cv })));
        };
        subscriber?.on('onVariableListChanged', handler);
        return () => subscriber?.off('onVariableListChanged', handler);
    }, [subscriber, variables]);

    return {
        currentVariables: variables,
    };
}
