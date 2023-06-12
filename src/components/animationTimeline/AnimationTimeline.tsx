import { Timeline } from '@chili-publish/grafx-shared-components';
import { AnimationTimelineWrapper } from './AnimationTimeline.styles';

interface AnimationTimelineI {
    scrubberTimeMs: number;
    animationLength: number;
}
function AnimationTimeline(props: AnimationTimelineI) {
    const { scrubberTimeMs, animationLength } = props;

    const handlePlay = async () => {
        await window.SDK.animation.playAnimation();
    };

    const handlePause = async () => {
        await window.SDK.animation.pauseAnimation();
    };

    const handleSetScrubberPosition = async (milliseconds: number) => {
        await window.SDK.animation.setScrubberPosition(milliseconds);
    };

    return (
        <AnimationTimelineWrapper>
            {animationLength > 0 && (
                <Timeline
                    animationLength={animationLength}
                    setScrubberPosition={(milliseconds: number) => handleSetScrubberPosition(milliseconds)}
                    playAnimation={handlePlay}
                    pauseAnimation={handlePause}
                    timestamp={scrubberTimeMs}
                />
            )}
        </AnimationTimelineWrapper>
    );
}

export default AnimationTimeline;
