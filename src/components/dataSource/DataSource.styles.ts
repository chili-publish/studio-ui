import styled, { createGlobalStyle, css } from 'styled-components';
import { getDataIdForSUI } from '../../utils/dataIds';

export const DATA_SOURCE_ID = getDataIdForSUI(`data-source-input`);

export const RowInfoContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 -${({ theme }) => theme.icon.padding};
    margin-top: 0.5rem;
`;

const inputStyles = css<{ disabled: boolean }>`
    cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')} !important;
`;
export const DataSourceInputStyle = createGlobalStyle<{ disabled: boolean }>`

    [data-id='${DATA_SOURCE_ID}-input-wrapper'] {
        ${inputStyles};
        * {
            ${inputStyles};
        }
        button {
            flex: 1 1 auto;
            padding-block: 0 ;
            padding-inline: ${({ theme }) => `0.25rem ${theme.icon.padding}`};

        }
        &:hover {
            svg {
                color: ${({ disabled, theme }) =>
                    disabled ? theme.icon.disabled.color : theme.icon.hover.color} !important;
            }
        }
    }
`;
