import { Timeline } from '@chili-publish/grafx-shared-components';
import { AnimationTimelineWrapper } from './AnimationTimeline.styles';

function AnimationTimeline() {
    const animationLength = 30000; // This should be dynamic

    return (
        <AnimationTimelineWrapper>
            <Timeline
                timestamp={0}
                animationLength={animationLength}
                setScrubberPosition={() => null}
                playAnimation={() => null}
                pauseAnimation={() => null}
            />
        </AnimationTimelineWrapper>
    );
}

export default AnimationTimeline;
