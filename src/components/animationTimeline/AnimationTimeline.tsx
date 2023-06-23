import { Timeline } from '@chili-publish/grafx-shared-components';
import { AnimationTimelineWrapper } from './AnimationTimeline.styles';

interface IAnimationTimeline {
    scrubberTimeMs: number;
    animationLength: number;
}
function AnimationTimeline(props: IAnimationTimeline) {
    const { scrubberTimeMs, animationLength } = props;

    const handlePlay = async () => {
        await window.SDK.animation.play();
    };

    const handlePause = async () => {
        await window.SDK.animation.pause();
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
