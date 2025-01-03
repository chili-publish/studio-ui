import { ConfigType, LayoutIntent, Variable } from '@chili-publish/studio-sdk';
import { mockMedia } from '@mocks/mockMedia';
import { mockVariables } from '@mocks/mockVariables';

// eslint-disable-next-line import/no-mutable-exports
export let onVariableListChangedCallback: ((variableList: Variable[]) => void) | undefined;
export const connectorSourceUrl = 'connectorSourceUrl';

jest.mock('@chili-publish/studio-sdk', () => {
    const originalModule = jest.requireActual('@chili-publish/studio-sdk');

    return {
        __esModule: true,
        ...originalModule,
        /* eslint-disable */
        default: function (config: ConfigType) {
            onVariableListChangedCallback = config.onVariableListChanged;
            const sdk = new originalModule.default(config);
            /* eslint-enable */
            return {
                ...sdk,
                loadEditor: () => '',
                configuration: { setValue: jest.fn() },
                connector: {
                    getById: jest.fn().mockResolvedValue({ parsedData: { source: { url: connectorSourceUrl } } }),
                    getState: jest.fn().mockImplementation(() => Promise.resolve({ parsedData: { type: 'ready' } })),
                    getAllByType: jest
                        .fn()
                        .mockImplementation(() => Promise.resolve({ success: true, parsedData: [] })),
                    getMappings: jest.fn().mockImplementation(() => Promise.resolve({ parsedData: [] })),
                },
                next: {
                    ...sdk.next,
                    connector: {
                        getById: jest.fn().mockResolvedValue({ parsedData: { source: { url: connectorSourceUrl } } }),
                        getState: jest
                            .fn()
                            .mockImplementation(() => Promise.resolve({ parsedData: { type: 'ready' } })),
                        getAllByType: jest
                            .fn()
                            .mockImplementation(() => Promise.resolve({ success: true, parsedData: [] })),
                        getMappings: jest.fn().mockImplementation(() => Promise.resolve({ parsedData: [] })),
                    },
                },
                document: { load: jest.fn().mockImplementation(() => Promise.resolve({ success: true })) },
                tool: { setHand: jest.fn() },
                canvas: { zoomToPage: jest.fn() },
                variable: {
                    setValue: jest.fn(),
                    getAll: jest.fn().mockImplementation(() => Promise.resolve({ parsedData: mockVariables })),
                },
                layout: {
                    getSelected: jest
                        .fn()
                        .mockImplementation(() =>
                            Promise.resolve({ parsedData: { intent: { value: LayoutIntent.digitalAnimated } } }),
                        ),
                },
                mediaConnector: {
                    query: jest.fn().mockImplementation(() => Promise.resolve({ parsedData: { data: mockMedia } })),
                    getCapabilities: jest
                        .fn()
                        .mockImplementation(() => Promise.resolve({ parsedData: { query: true } })),
                },
                animation: { pause: jest.fn().mockImplementation(() => Promise.resolve({ success: true })) },
                dataSource: { getDataSource: jest.fn().mockResolvedValue({ parsedData: null }) },
            };
        },
    };
});
