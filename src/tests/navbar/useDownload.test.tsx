import { DownloadFormats } from '@chili-publish/studio-sdk';
import { renderHook } from '@testing-library/react';
import useDownload from '../../components/navbar/downloadPanel/useDownload';
import * as UserInterfaceDetailsContext from '../../components/navbar/UserInterfaceDetailsContext';
import * as UiConfigContext from '../../contexts/UiConfigContext';

describe('useDownload', () => {
    test('default download options show all download options', () => {
        jest.spyOn(UiConfigContext, 'useUiConfigContext').mockImplementation(() => {
            return UiConfigContext.UiConfigContextDefaultValues;
        });
        const { result } = renderHook(() => useDownload({ hideDownloadPanel: () => null }));
        expect(result.current.options.length).toBe(6);
    });

    test('only false download options, show the onew that are not false', () => {
        jest.spyOn(UserInterfaceDetailsContext, 'useUserInterfaceDetailsContext').mockImplementation(() => {
            return {
                ...UserInterfaceDetailsContext.UserInterfaceDetailsContextDefaultValues,
                outputSettings: { mp4: false, gif: false, jpg: false, pdf: false, html: false },
            };
        });
        const { result } = renderHook(() => useDownload({ hideDownloadPanel: () => null }));
        expect(result.current.options.length).toBe(1);
        expect(result.current.options[0].value).toBe(DownloadFormats.PNG);
    });

    test('only true download options, show only that option', () => {
        jest.spyOn(UserInterfaceDetailsContext, 'useUserInterfaceDetailsContext').mockImplementation(() => {
            return {
                ...UserInterfaceDetailsContext.UserInterfaceDetailsContextDefaultValues,
                outputSettings: { mp4: true, gif: true },
            };
        });
        const { result } = renderHook(() => useDownload({ hideDownloadPanel: () => null }));
        expect(result.current.options.length).toBe(2);
        expect(result.current.options[0].value).toBe(DownloadFormats.MP4);
    });

    test('mix true and false listens to those, not provided means same as falls', () => {
        jest.spyOn(UserInterfaceDetailsContext, 'useUserInterfaceDetailsContext').mockImplementation(() => {
            return {
                ...UserInterfaceDetailsContext.UserInterfaceDetailsContextDefaultValues,
                outputSettings: { mp4: true, gif: false },
            };
        });
        const { result } = renderHook(() => useDownload({ hideDownloadPanel: () => null }));
        expect(result.current.options.length).toBe(1);
        expect(result.current.options[0].value).toBe(DownloadFormats.MP4);
    });

    test('Show output settings that are coming from selected user interface', () => {
        jest.spyOn(UserInterfaceDetailsContext, 'useUserInterfaceDetailsContext').mockImplementation(() => {
            return {
                ...UserInterfaceDetailsContext.UserInterfaceDetailsContextDefaultValues,
                userInterfaceOutputSettings: [
                    {
                        name: 'MP4',
                        id: '1',
                        description: 'some decs',
                        type: DownloadFormats.MP4,
                        layoutIntents: ['digitalAnimated'],
                        dataSourceEnabled: false,
                    },
                    {
                        name: 'GIF',
                        id: '2',
                        description: 'some decs',
                        type: DownloadFormats.MP4,
                        layoutIntents: ['digitalAnimated'],
                        dataSourceEnabled: false,
                    },
                ],
            };
        });
        const { result } = renderHook(() => useDownload({ hideDownloadPanel: () => null }));
        expect(result.current.options?.length).toBe(2);
    });
});
