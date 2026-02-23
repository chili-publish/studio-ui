import styled from 'styled-components';

export const ToolbarWrapper = styled.div`
    position: absolute;
    top: 0.875rem;
    left: 50%;
    transform: translate(-50%, 0%);
    max-width: 43rem;
    height: 3.5rem;
    background-color: ${({ theme }) => theme.panel.backgroundColor};
    border-radius: 0.5rem;
    border: 1px solid ${({ theme }) => theme.panel.borderColor};
    padding: 0.625rem 1.25rem;
    display: flex;
    align-items: center;
`;

export const ConstraintWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 0.625rem;
    [data-id$='-style-constraint'] {
        width: 9.063rem;
    }
`;

export const Separator = styled.div`
    width: 1px;
    height: 2.5rem;
    background-color: ${({ theme }) => theme.themeColors.inputBackgroundColor};
    margin: 0 0.875rem;
`;
