import styled from 'styled-components';

export const LayoutInputsContainer = styled.div`
    margin: 1rem 0;
    box-sizing: border-box;
    display: flex;
    gap: 1rem;
`;

export const IconWrapper = styled.div<{ hasHelpText: boolean }>`
    display: flex;
    align-self: flex-end;
    margin-bottom: ${(props) => (props.hasHelpText ? '2rem' : '0.75rem')};
`;
