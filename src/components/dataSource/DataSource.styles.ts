import { ITheme } from '@chili-publish/grafx-shared-components';
import styled, { createGlobalStyle, css } from 'styled-components';
import { getDataIdForSUI } from '../../utils/dataIds';

export const DATA_SOURCE_ID = getDataIdForSUI(`data-source-input`);

export const RowInfoContainer = styled.div<{ iconStyle: ITheme['icon'] }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 -${(props) => props.iconStyle.padding};
    margin-top: 0.5rem;
`;

const inputStyles = css<{ disabled: boolean }>`
    cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')} !important;
`;
export const DataSourceInputStyle = createGlobalStyle<{ disabled: boolean; iconStyle: ITheme['icon'] }>`

    [data-id='${DATA_SOURCE_ID}-input-wrapper'] {
        ${inputStyles};
        * {
            ${inputStyles};
        }
        button {
            flex: 1 1 auto;
            padding: ${({ iconStyle }) => `0 ${iconStyle.padding} 0 0.25rem`};
        }
        &:hover {
            svg {
                color: ${({ disabled, iconStyle }) =>
                    disabled ? iconStyle.disabled.color : iconStyle.hover.color} !important;
            }
        }
    }
`;
