import styled from 'styled-components';

export const Container = styled.div<{ isVisible?: boolean }>`
    display: ${(props) => (props.isVisible ? 'block' : 'none')};
    width: 100%;
    height: 100%;
`;
