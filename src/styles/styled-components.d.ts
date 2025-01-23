import { ITheme } from '@chili-publish/grafx-shared-components';

declare module 'styled-components' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DefaultTheme extends ITheme {}
}
