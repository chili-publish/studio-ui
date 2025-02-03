import EditorSDK from '@chili-publish/studio-sdk';
import '@testing-library/jest-dom';
import { mock } from 'jest-mock-extended';

jest.mock('@chili-publish/studio-sdk');
jest.mock('@chili-publish/studio-sdk/lib/src/next');

const ResizeObserver = require('resize-observer-polyfill');

global.ResizeObserver = ResizeObserver;

window.matchMedia =
    window.matchMedia ||
    function matchMedia() {
        return {
            matches: false,
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            addEventListener() {},
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            removeEventListener() {},
        };
    };

const mockSDK = mock<EditorSDK>();
mockSDK.mediaConnector.detail = jest
    .fn()
    .mockImplementation()
    .mockReturnValue(
        Promise.resolve({
            parsedData: {
                id: 'f82a05ba-c592-4f3f-89a3-5b92ca096d01',
                name: 'Overprint Doc FOGRA',
                relativePath: '/00 CHILI SUPPORT',
                type: 0,
                extension: 'jpeg',
                metaData: {},
            },
        }),
    );

mockSDK.mediaConnector.download = jest
    .fn()
    .mockImplementation()
    .mockReturnValue(Promise.resolve([1, 2, 3]));

mockSDK.connector.getState = jest
    .fn()
    .mockImplementation()
    .mockReturnValue(Promise.resolve({ parsedData: { type: 'ready' } }));
mockSDK.variable.setValue = jest.fn().mockImplementation();

mockSDK.connector.waitToBeReady = jest
    .fn()
    .mockImplementation()
    .mockReturnValue(Promise.resolve([1, 2, 3]));

window.StudioUISDK = mockSDK;

/* eslint-disable */
// Promise.withResolvers polyfill. Remove once Node.js introduce it's full support
if (Promise.withResolvers === undefined) {
    Promise.withResolvers = function () {
        let resolve;
        let reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    } as any;
}
/* eslint-enable */
