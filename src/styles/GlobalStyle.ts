import { createGlobalStyle } from 'styled-components';
import './index.css';

const GlobalStyle = createGlobalStyle<{ fontFamily?: string }>`
    html,
    body {
        padding: 0;
        margin: 0;
    }

    a {
        color: inherit;
        text-decoration: none;
    }

    ::-webkit-scrollbar {
        width: 0.5rem;
        height: 0.5rem;
    }

    ::-webkit-scrollbar-track {
        visibility: hidden;
    }

    ::-webkit-scrollbar-thumb {
        border-radius: 0.25rem;
        background: rgba(0, 0, 0, 0.5);
    }

    ::-webkit-scrollbar:window-inactive {
        visibility: hidden;
    }
    ::-webkit-scrollbar-corner {
        visibility: hidden;
    }

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
