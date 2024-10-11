import { ITheme } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const MainContentContainer = styled.div`
    display: flex;
    height: calc(100vh - 4rem);
    width: 100%;
`;

export const CanvasContainer = styled.div`
    width: 100%;
`;

export const Container = styled.div<{ canvas: ITheme['canvas'] }>`
    background-color: ${({ canvas }) => canvas.backgroundColor};
`;
