import styled from 'styled-components';

export const VariableContainer = styled.div`
    display: flex;
    flex-direction: column;
`;
export const VariableLabel = styled.span`
    color: red;
`;

export const BooleanVariableContainer = styled.div`
    min-height: 2.5rem;
    display: flex;
    align-items: center;
`;

export const HelpTextWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    width: 100%;
    > div:nth-child(2) {
        margin-bottom: 0;
    }
`;
