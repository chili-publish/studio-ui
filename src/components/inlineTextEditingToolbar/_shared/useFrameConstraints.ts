import { FrameConstraints } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from 'src/store';
import { selectedFrameContent } from 'src/store/reducers/frameReducer';

const useFrameConstraints = () => {
    const selectedFrame = useAppSelector(selectedFrameContent);
    const [constraintsData, setConstraintsData] = useState<FrameConstraints | null>(null);

    const getConstraintsData = useCallback(async () => {
        if (!selectedFrame?.id) {
            setConstraintsData(null);
            return;
        }

        try {
            const frameConstraints = await window.StudioUISDK.frame.constraints.get(selectedFrame.id);
            if (frameConstraints?.parsedData) {
                setConstraintsData(frameConstraints.parsedData);
            }
        } catch {
            // eslint-disable-next-line no-console
            console.error('Error getting frame constraints');
            setConstraintsData(null);
        }
    }, [selectedFrame]);

    useEffect(() => {
        getConstraintsData();
    }, [getConstraintsData]);

    return { frameConstraints: constraintsData };
};

export default useFrameConstraints;
