import styled from 'styled-components';

export const GroupedVariablesWrapper = styled.div``;
export const CollapseWrapper = styled.div<{ hasTopBorder?: boolean; hasBottomMargin?: boolean }>`
    border-bottom: 2px solid ${(props) => props.theme.panel.borderColor};
    border-top: ${(props) => (props.hasTopBorder ? `2px solid ${props.theme.panel.borderColor}` : 'none')};

    margin-left: -1.125rem;
    margin-right: -1.125rem;
    margin-bottom: ${(props) => (props.hasBottomMargin ? '0.5rem' : '0')};
    [data-id*='collapse-group'] {
        [data-id*='-header'],
        [data-id*='-body'] {
            padding: 0 1.25rem;
        }
    }
`;
export const CollapseContent = styled.div`
    padding-bottom: 1rem;
`;
