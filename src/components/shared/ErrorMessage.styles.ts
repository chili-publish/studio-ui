import styled from 'styled-components';

export const ErrorMessage = styled.span`
    color: ${({ theme }) => theme.themeColors.errorColor};
    font-size: 0.75rem;
    margin-top: 0.5rem;
`;
