import { ITheme } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const MainContentContainer = styled.div<{ navbarHeight?: string }>`
    display: flex;
    height: ${(props) => `calc(100vh - ${props.navbarHeight || 0})`};
    width: 100%;
`;

export const CanvasContainer = styled.div`
    width: 100%;
`;

export const Container = styled.div<{ canvas: ITheme['canvas'] }>`
    background-color: ${({ canvas }) => canvas.backgroundColor};
`;
