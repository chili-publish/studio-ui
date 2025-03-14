import { DownloadFormats } from '@chili-publish/studio-sdk';
import { renderHook } from '@testing-library/react';
import useDownload from '../../components/navbar/downloadPanel/useDownload';
import * as UiConfigContext from '../../contexts/UiConfigContext';
import * as OutputSettingsContext from '../../components/navbar/OutputSettingsContext';

describe('useDownload', () => {
    test('default download options show all download options', () => {
        jest.spyOn(UiConfigContext, 'useUiConfigContext').mockImplementation(() => {
            return UiConfigContext.UiConfigContextDefaultValues;
        });
        const { result } = renderHook(() => useDownload(() => null));
        expect(result.current.downloadOptions.length).toBe(5);
    });

    test('only false download options, show the onew that are not false', () => {
        jest.spyOn(OutputSettingsContext, 'useOutputSettingsContext').mockImplementation(() => {
            return {
                ...OutputSettingsContext.OutputSettingsContextDefaultValues,
                outputSettings: { mp4: false, gif: false, jpg: false, pdf: false },
            };
        });
        const { result } = renderHook(() => useDownload(() => null));
        expect(result.current.downloadOptions.length).toBe(1);
        expect(result.current.downloadOptions[0].value).toBe(DownloadFormats.PNG);
    });

    test('only true download options, show only that option', () => {
        jest.spyOn(OutputSettingsContext, 'useOutputSettingsContext').mockImplementation(() => {
            return {
                ...OutputSettingsContext.OutputSettingsContextDefaultValues,
                outputSettings: { mp4: true, gif: true },
            };
        });
        const { result } = renderHook(() => useDownload(() => null));
        expect(result.current.downloadOptions.length).toBe(2);
        expect(result.current.downloadOptions[0].value).toBe(DownloadFormats.MP4);
    });

    test('mix true and false listens to those, not provided means same as falls', () => {
        jest.spyOn(OutputSettingsContext, 'useOutputSettingsContext').mockImplementation(() => {
            return {
                ...OutputSettingsContext.OutputSettingsContextDefaultValues,
                outputSettings: { mp4: true, gif: false },
            };
        });
        const { result } = renderHook(() => useDownload(() => null));
        expect(result.current.downloadOptions.length).toBe(1);
        expect(result.current.downloadOptions[0].value).toBe(DownloadFormats.MP4);
    });

    test('Show output settings that are coming from selected user interface', () => {
        jest.spyOn(OutputSettingsContext, 'useOutputSettingsContext').mockImplementation(() => {
            return {
                ...OutputSettingsContext.OutputSettingsContextDefaultValues,
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
        const { result } = renderHook(() => useDownload(() => null));
        expect(result.current.userInterfaceDownloadOptions?.length).toBe(2);
    });
});
