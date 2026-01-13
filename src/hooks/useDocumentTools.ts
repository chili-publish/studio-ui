import SDK, { FrameLayoutType } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useState } from 'react';
import { defaultStudioOptions } from 'src/utils/studioOptions.util';

export const useDocumentTools = (sdkRef: SDK | undefined, selectedPageId: string | null) => {
    const [visibleFrames, setVisibleFrames] = useState<NonNullable<FrameLayoutType>[]>([]);

    const toggleTool = useCallback(async () => {
        if (!selectedPageId || !sdkRef) return;
        const { parsedData: pageFrames } = await sdkRef.frame.getAllByPageId(selectedPageId);
        if (!pageFrames) return;
        const visiblePageFrames = pageFrames.filter((frame) =>
            visibleFrames.find((visibleFrame) => visibleFrame.id === frame.id),
        );

        // TODO: Most likely will be optimized by Flutter Team to have constrains as part of "FrameLayoutType" interface
        // to avoid this extra request
        const constraintsArray = await Promise.all(
            visiblePageFrames.map((frame) => sdkRef.frame.constraints.get(frame.id)),
        );

        const framesWithEnabledConstraints = constraintsArray.some(({ parsedData: constraints }) => {
            return constraints?.selectionAllowed.value;
        });
        if (framesWithEnabledConstraints) {
            await sdkRef.tool.setSelect();
            await sdkRef.configuration.updateStudioOptions({
                ...defaultStudioOptions,
                shortcutOptions: { ...defaultStudioOptions.shortcutOptions, hand: { enabled: false } },
            });
        } else {
            const { parsedData: selectedFrames } = await sdkRef.frame.getSelected();
            if (selectedFrames?.length) {
                await sdkRef.frame.deselectAll();
            }

            await sdkRef.tool.setHand();
            await sdkRef.configuration.updateStudioOptions(defaultStudioOptions);
        }
    }, [sdkRef, selectedPageId, visibleFrames]);

    useEffect(() => {
        toggleTool();
    }, [toggleTool]);

    useEffect(() => {
        const unsubscriber = sdkRef?.config.events.onFramesLayoutChanged.registerCallback(async (framesLayout) => {
            setVisibleFrames(
                framesLayout.filter((frame) => !!frame?.isVisible.value) as NonNullable<FrameLayoutType>[],
            );
        });
        return () => {
            unsubscriber?.();
        };
    }, [sdkRef]);
};
