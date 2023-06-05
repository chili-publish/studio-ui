import { Timeline } from '@chili-publish/grafx-shared-components';
import { AnimationTimelineWrapper } from './AnimationTimeline.styles';

function AnimationTimeline() {
    const animationLength = 30000; // This should be dynamic

    const handlePlay = () => {
        // eslint-disable-next-line no-console
        console.log(`[${AnimationTimeline.name}] Play`);
    };

    const handlePause = () => {
        // eslint-disable-next-line no-console
        console.log(`[${AnimationTimeline.name}] Pause`);
    };

    const handleSetScrubberPosition = () => {
        // eslint-disable-next-line no-console
        console.log(`[${AnimationTimeline.name}] Scrubber position changed`);
    };

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
