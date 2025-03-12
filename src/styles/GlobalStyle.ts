import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle<{ fontFamily?: string }>`
    /* Target the root element of your injected app */
    #studio-ui-root-wrapper {
        /* Isolate from external styles */
        isolation: isolate;
        
        /* Set base styles */
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: ${(props) => props.fontFamily || 'Roboto'} !important;
        * {
            font-family: ${(props) => props.fontFamily || 'Roboto'};
        }
    }

    /* Ensure all child elements inherit the box-sizing */
    #studio-ui-root-wrapper *,
    #studio-ui-root-wrapper *::before,
    #studio-ui-root-wrapper *::after {
        box-sizing: border-box;
    }

    /* Reset only specific inherited properties we want to control */
    #studio-ui-root-wrapper {
        color: inherit;
        background: transparent;
        line-height: normal;
        font-size: 1rem;
    }
`;

export default GlobalStyle;
