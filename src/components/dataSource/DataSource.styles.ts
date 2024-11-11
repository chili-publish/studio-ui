import { ITheme } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const RowInfoContainer = styled.div<{ iconStyle: ITheme['icon'] }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 -${(props) => props.iconStyle.padding};
    margin-top: 0.5rem;
`;
