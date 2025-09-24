import { ConfigType, LayoutIntent, LayoutPropertiesType } from '@chili-publish/studio-sdk';
import { act, screen, waitFor } from '@testing-library/react';
import App from '../App';
import { ProjectConfig } from '../types/types';
import { getDataTestIdForSUI } from '../utils/dataIds';
import { renderWithProviders } from './mocks/Provider';

const projectConfig = {
    projectId: 'projectId',
    projectName: 'projectName',
    onProjectInfoRequested: () => Promise.resolve(''),
    onProjectDocumentRequested: () => Promise.resolve({ deocId: '1' }),
    onProjectLoaded: () => null,
    onProjectSave: () => null,
    onAuthenticationRequested: () => 'authToken',
    onAuthenticationExpired: () => null,
    onUserInterfaceBack: () => null,
    onLogInfoRequested: () => null,
    onProjectGetDownloadLink: () => null,
    onEngineInitialized: () => null,
    outputSettings: {},
    uiOptions: {},
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
                loadEditor: () => '',
                configuration: { setValue: jest.fn() },
                next: {
                    connector: {
                        getAllByType: jest
                            .fn()
                            .mockImplementation(() => Promise.resolve({ success: true, parsedData: [] })),
                    },
                },
                document: { load: jest.fn().mockImplementation(() => Promise.resolve({ success: true })) },
                tool: { setHand: jest.fn() },
                canvas: { zoomToPage: jest.fn() },
                dataSource: { getDataSource: jest.fn().mockResolvedValue({ parsedData: null }) },
            };
        },
    };
});

describe('AppPrintIntent', () => {
    it('Timeline should not be shown if layout intent is not Digital animated', async () => {
        renderWithProviders(<App projectConfig={projectConfig as unknown as ProjectConfig} />);

        act(() => {
            const layoutProperties = {
                intent: { value: LayoutIntent.print },
                timelineLengthMs: {},
            } as unknown as LayoutPropertiesType;
            window.StudioUISDK.config.events.onSelectedLayoutPropertiesChanged.trigger(layoutProperties);
        });

        await waitFor(() => {
            expect(screen.queryByTestId(getDataTestIdForSUI('timeline-wrapper'))).not.toBeInTheDocument();
        });
    });
});
