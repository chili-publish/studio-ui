import { ReactNode } from 'react';
import { NumberBadge, Wrapper } from './Pages.styles';

interface PreviewCardBadgeProps {
    badgeNumber?: number;
    children: ReactNode;
}

export function PreviewCardBadge({ badgeNumber, children }: PreviewCardBadgeProps) {
    return (
        <Wrapper key={`card-wrapped-${badgeNumber}`}>
            {children}
            {badgeNumber && <NumberBadge>{badgeNumber}</NumberBadge>}
        </Wrapper>
    );
}
