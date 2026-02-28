import { Frame, FrameConstraints } from '@chili-publish/studio-sdk';
import { useEffect, useEffectEvent, useState } from 'react';
import { useAppSelector } from 'src/store';
import { selectedFrameContent } from 'src/store/reducers/frameReducer';

const useFrameConstraints = () => {
    const selectedFrame = useAppSelector(selectedFrameContent);
    const [constraintsData, setConstraintsData] = useState<FrameConstraints | null>(null);

    const getConstraintsData = useEffectEvent(async (frame: Frame | null) => {
        if (!frame?.id) {
            setConstraintsData(null);
            return;
        }

        try {
            const frameConstraints = await window.StudioUISDK.frame.constraints.get(frame.id);
            if (frameConstraints?.parsedData) {
                setConstraintsData(frameConstraints.parsedData);
            }
        } catch {
            // eslint-disable-next-line no-console
            console.error('Error getting frame constraints');
            setConstraintsData(null);
        }
    });

    useEffect(() => {
        getConstraintsData(selectedFrame);
    }, [selectedFrame]);

    return { frameConstraints: constraintsData };
};

export default useFrameConstraints;
