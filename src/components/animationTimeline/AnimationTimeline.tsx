import { Timeline } from '@chili-publish/grafx-shared-components';
import { useCallback } from 'react';
import { AnimationTimelineWrapper } from './AnimationTimeline.styles';
import { getDataTestIdForSUI } from '../../utils/dataIds';

interface IAnimationTimeline {
    scrubberTimeMs: number;
    animationLength: number;
    isAnimationPlaying: boolean;
}
function AnimationTimeline(props: IAnimationTimeline) {
    const { scrubberTimeMs, animationLength, isAnimationPlaying } = props;

    const handlePlay = async () => {
        await window.StudioUISDK.animation.play();
    };

    const handlePause = useCallback(async () => {
        await window.StudioUISDK.animation.pause();
    }, []);

    const handleSetScrubberPosition = async (milliseconds: number) => {
        await window.StudioUISDK.animation.setScrubberPosition(milliseconds);
    };

    return (
        <AnimationTimelineWrapper data-testid={getDataTestIdForSUI('timeline-wrapper')}>
            {animationLength > 0 && (
                <Timeline
                    animationLength={animationLength}
                    setScrubberPosition={(milliseconds: number) => handleSetScrubberPosition(milliseconds)}
                    playAnimation={handlePlay}
                    pauseAnimation={handlePause}
                    timestamp={scrubberTimeMs}
                    isPlaying={isAnimationPlaying}
                />
            )}
        </AnimationTimelineWrapper>
    );
}

export default AnimationTimeline;
