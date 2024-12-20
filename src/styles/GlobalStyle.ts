import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle<{ fontFamily?: string }>`
    html,
    body {
        font-family: ${(props) => props.fontFamily || 'Roboto'};
    }
`;
export default GlobalStyle;
