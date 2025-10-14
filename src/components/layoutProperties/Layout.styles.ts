import styled from 'styled-components';

export const LayoutInputsContainer = styled.div`
    margin: 1rem 0;
    box-sizing: border-box;
    display: flex;
    gap: 1rem;
`;

export const IconWrapper = styled.div<{ hasHelpText: boolean }>`
    display: flex;
    align-self: flex-start;
    cursor: pointer;
    margin-top: 2.25rem;
`;

export const ButtonsWrapper = styled.div`
    display: flex;
    gap: 0.75rem;
    margin-top: 0.75rem;
    button {
        flex: 1;
    }
`;

export const ErrorMessageContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 0.3125rem;
    margin-top: 0.5rem;
    cursor: default;
    svg {
        width: 0.75rem;
        color: ${({ theme }) => theme.themeColors.errorColor};
    }
    * {
        margin-top: 0 !important;
    }
`;

export const RangeConstraintErrorMessageWrapper = styled.div`
    max-width: 15rem;
`;
