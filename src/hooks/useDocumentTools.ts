import SDK, { FrameLayoutType } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useState } from 'react';

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
            return (
                constraints?.selectable.value ||
                constraints?.horizontal.value.allowed ||
                constraints?.vertical.value.allowed ||
                constraints?.rotation.value.allowed ||
                constraints?.resize.value.allowed
            );
        });
        if (framesWithEnabledConstraints) {
            await sdkRef.tool.setSelect();
        } else {
            const { parsedData: selectedFrames } = await sdkRef.frame.getSelected();
            if (selectedFrames?.length) {
                await sdkRef.frame.deselectAll();
            }

            await sdkRef.tool.setHand();
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
