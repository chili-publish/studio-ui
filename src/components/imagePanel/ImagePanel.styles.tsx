import styled from 'styled-components';

export const Grid = styled.div`
    margin-top: 1.25rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 1.25rem;
`;

export const GridItem = styled.div<{ itemId: number }>`
    width: 7.5rem;
    height: 10.625rem;
    margin-inline-start: ${({ itemId }) => (itemId % 2 ? '0' : '1.25rem')};
    margin-inline-end: ${({ itemId }) => (itemId % 2 ? '1.25rem' : '0')};
`;
