import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle<{ fontFamily?: string }>`
    /* Target the root element of your injected app */
    #studio-ui-root-wrapper {
        /* Reset all inherited properties */
        all: initial;
        
        /* Re-enable display */
        display: block;
    }

    /* Target all elements within your app */
    #studio-ui-root-wrapper *,
    #studio-ui-root-wrapper *::before,
    #studio-ui-root-wrapper *::after {
        all: unset;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: ${(props) => props.fontFamily || 'Roboto'} !important;
    }

    /* Restore default display behaviors for common elements */
    #studio-ui-root-wrapper div,
    #studio-ui-root-wrapper section,
    #studio-ui-root-wrapper article,
    #studio-ui-root-wrapper main {
        display: block;
    }

    #studio-ui-root-wrapper span,
    #studio-ui-root-wrapper a {
        display: inline;
    }
`;

export default GlobalStyle;
