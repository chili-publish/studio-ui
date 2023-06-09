import { Timeline } from '@chili-publish/grafx-shared-components';
import { AnimationTimelineWrapper } from './AnimationTimeline.styles';

interface AnimationTimelineI {
    scrubberTimeMs: number;
    animationLength: number;
}
function AnimationTimeline(props: AnimationTimelineI) {
    const { scrubberTimeMs, animationLength } = props;

    // const test = animationLength || 8000;
    const handlePlay = async () => {
        await window.SDK.animation.playAnimation();
    };

    const handlePause = async () => {
        await window.SDK.animation.pauseAnimation();
    };

    const handleSetScrubberPosition = async (milliseconds: number) => {
        await window.SDK.animation.setScrubberPosition(milliseconds);
    };

    // TODO: pass this to the timeline to set the thumb position
    // eslint-disable-next-line no-console
    console.log('%c⧭ scrubberTimeMs', 'color: #f279ca', scrubberTimeMs);

    return (
        <AnimationTimelineWrapper>
            {animationLength > 0 && (
                <Timeline
                    animationLength={animationLength}
                    setScrubberPosition={(milliseconds: number) => handleSetScrubberPosition(milliseconds)}
                    playAnimation={handlePlay}
                    pauseAnimation={handlePause}
                />
            )}
        </AnimationTimelineWrapper>
    );
}

export default AnimationTimeline;
