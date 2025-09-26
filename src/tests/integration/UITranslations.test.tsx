import { act, render, screen } from '@testing-library/react';
import { mockLayout, mockLayouts } from '@mocks/mockLayout';
import { ConfigType } from '@chili-publish/studio-sdk';
import userEvent from '@testing-library/user-event';
import { getDataTestIdForSUI } from 'src/utils/dataIds';
import StudioUI from '../../main';

jest.mock('@chili-publish/studio-sdk');

// Mock ProjectDataClient
jest.mock('../../services/ProjectDataClient', () => ({
    ProjectDataClient: jest.fn().mockImplementation(() => ({
        fetchFromUrl: jest.fn().mockResolvedValue('{"test": "document"}'),
        saveToUrl: jest.fn().mockResolvedValue(undefined),
    })),
}));

const mockUITranslations = {
    formBuilder: {
        variables: {
            header: 'Vars translated',
            helpText: 'Vars help translated',
        },
        datasource: {
            header: 'DS translated',
            helpText: 'DS help translated',
            row: 'Row translated',
            inputLabel: 'Data row translated',
        },
        layouts: {
            header: 'Layouts translated',
            helpText: 'Layouts help translated',
            inputLabel: 'Select layout translated',
            width: 'Width translated',
            height: 'Height translated',
        },
    },
    toolBar: {
        downloadButton: {
            label: 'Download translated',
            outputSelector: {
                label: 'Output translated',
            },
        },
    },
};

const config = {
    selector: 'sui-root',
    projectUploadUrl: 'http://abc.com/projects/projectId',
    projectId: 'projectId',
    graFxStudioEnvironmentApiBaseUrl: 'http://abc.com',
    authToken: 'token',
    projectName: '',
    uiTranslations: mockUITranslations,
};

jest.mock('@chili-publish/studio-sdk', () => {
    const originalModule = jest.requireActual('@chili-publish/studio-sdk');

    return {
        __esModule: true,
        ...originalModule,
        /* eslint-disable */
        default: function (config: ConfigType) {
            const sdk = new originalModule.default(config);
            /* eslint-enable */
            return {
                ...sdk,
                document: { load: jest.fn().mockImplementation(() => Promise.resolve({ success: true })) },
                configuration: {
                    setValue: jest.fn(),
                },
                tool: {
                    setHand: jest.fn(),
                },
                layout: {
                    getSelected: jest
                        .fn()
                        .mockImplementation(() => Promise.resolve({ success: true, parsedData: mockLayout })),
                },
                dataSource: {
                    getDataSource: jest.fn().mockImplementation(() =>
                        Promise.resolve({
                            success: true,
                            parsedData: {
                                id: '1',
                                name: 'Connector name',
                            },
                        }),
                    ),
                    setDataRow: jest.fn(),
                },
                dataConnector: {
                    getPage: jest.fn().mockResolvedValueOnce({
                        parsedData: {
                            data: [
                                { id: '1', name: 'Joe', age: 15 },
                                { id: '2', name: 'Oliver', age: 105 },
                            ],
                        },
                    }),
                },
            };
        },
    };
});
describe('UITranslations Integration', () => {
    beforeEach(() => {
        render(<div id="sui-root" />);
    });

    it('should render translated UI labels', async () => {
        const user = userEvent.setup();
        await act(() => {
            StudioUI.studioUILoaderConfig(config);
        });

        await act(() => {
            window.StudioUISDK.config.events.onLayoutsChanged.trigger(mockLayouts);
            window.StudioUISDK.config.events.onSelectedLayoutIdChanged.trigger(mockLayout.id);
        });

        // datasource
        expect(screen.getByText('DS translated')).toBeInTheDocument();
        expect(screen.getByText('DS help translated')).toBeInTheDocument();

        // layouts
        expect(screen.getByText('Layouts translated')).toBeInTheDocument();
        expect(screen.getByText('Layouts help translated')).toBeInTheDocument();
        expect(screen.getByText('Select layout translated')).toBeInTheDocument();
        expect(screen.getByText('Width translated')).toBeInTheDocument();
        expect(screen.getByText('Height translated')).toBeInTheDocument();

        // variables
        expect(screen.getByText('Vars translated')).toBeInTheDocument();
        expect(screen.getByText('Vars help translated')).toBeInTheDocument();

        // toolBar
        expect(screen.getByText('Download translated')).toBeInTheDocument();
        const downloadBtn = screen.getByTestId(getDataTestIdForSUI('navbar-item-download-translated'))
            .firstChild as HTMLButtonElement;
        await user.click(downloadBtn);
        expect(screen.getByText('Output translated')).toBeInTheDocument();
    });
});
