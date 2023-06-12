import { Timeline } from '@chili-publish/grafx-shared-components';
import { AnimationTimelineWrapper } from './AnimationTimeline.styles';

function AnimationTimeline() {
    const animationLength = 30000; // This should be dynamic

    const handlePlay = () => null;

    const handlePause = () => null;

    const handleSetScrubberPosition = () => null;

    return (
        <AnimationTimelineWrapper>
            <Timeline
                animationLength={animationLength}
                setScrubberPosition={handleSetScrubberPosition}
                playAnimation={handlePlay}
                pauseAnimation={handlePause}
            />
        </AnimationTimelineWrapper>
    );
}

export default AnimationTimeline;
