import styled from 'styled-components';

export const ColorContainer = styled.div`
    width: 2.5rem;
    min-width: 2.5rem !important;
    height: 2.5rem;
    border-radius: 4px;
    background-color: ${({ color }) => color ?? 'transparent'};
    cursor: pointer;
`;
