// eslint-disable-next-line import/no-extraneous-dependencies
import fetch from 'jest-mock-fetch';
import '@testing-library/jest-dom';
import { mock } from 'jest-mock-extended';
import EditorSDK from '@chili-publish/studio-sdk';

jest.mock('@chili-publish/studio-sdk');

// eslint-disable-next-line @typescript-eslint/no-empty-function
window.HTMLElement.prototype.scrollIntoView = () => {
    // do nothing
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.fetch = fetch;

window.matchMedia =
    window.matchMedia ||
    // eslint-disable-next-line func-names
    function () {
        return {
            matches: false,
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            addEventListener() {
                // do nothing
            },
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            removeEventListener() {
                // do nothing
            },
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

window.SDK = mockSDK;
