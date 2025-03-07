import { Timeline } from '@chili-publish/grafx-shared-components';
import { useCallback } from 'react';
import { AnimationTimelineWrapper } from './AnimationTimeline.styles';
import { getDataTestIdForSUI } from '../../utils/dataIds';
import { useUiConfigContext } from '../../contexts/UiConfigContext';

interface IAnimationTimeline {
    scrubberTimeMs: number;
    animationLength: number;
    isAnimationPlaying: boolean;
}
function AnimationTimeline(props: IAnimationTimeline) {
    const { scrubberTimeMs, animationLength, isAnimationPlaying } = props;
    const { uiOptions } = useUiConfigContext();

    const handlePlay = useCallback(async () => {
        await window.StudioUISDK.animation.play();
    }, []);

    const handlePause = useCallback(async () => {
        await window.StudioUISDK.animation.pause();
    }, []);

    const handleSetScrubberPosition = useCallback(async (milliseconds: number) => {
        await window.StudioUISDK.animation.setScrubberPosition(milliseconds);
    }, []);

    if (uiOptions.widgets?.bottomBar?.visible === false) return null;
    return (
        <AnimationTimelineWrapper data-testid={getDataTestIdForSUI('timeline-wrapper')}>
            {animationLength > 0 && (
                <Timeline
                    animationLength={animationLength}
                    setScrubberPosition={handleSetScrubberPosition}
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
