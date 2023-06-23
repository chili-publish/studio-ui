import '@testing-library/jest-dom';
import { mock } from 'jest-mock-extended';
import EditorSDK from '@chili-publish/studio-sdk';

jest.mock('@chili-publish/studio-sdk');
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

mockSDK.connector.getById = jest
    .fn()
    .mockImplementation()
    .mockReturnValue(Promise.resolve({ parsedData: { type: 'ready' } }));
mockSDK.variable.setValue = jest.fn().mockImplementation();

mockSDK.connector.waitToBeReady = jest
    .fn()
    .mockImplementation()
    .mockReturnValue(Promise.resolve([1, 2, 3]));

window.SDK = mockSDK;
