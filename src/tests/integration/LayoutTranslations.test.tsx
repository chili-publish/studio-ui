import { act, render, screen, waitFor } from '@testing-library/react';
import { mockLayout, mockLayouts } from '@mocks/mockLayout';
import { ConfigType } from '@chili-publish/studio-sdk';
import { getDataTestIdForSUI } from 'src/utils/dataIds';
import userEvent from '@testing-library/user-event';
import StudioUI from '../../main';

jest.mock('@chili-publish/studio-sdk');

const environmentBaseURL = 'http://abc.com';
const projectID = 'projectId';
const token = 'token';

const layoutTranslations = {
    L1: { displayName: 'Translated L1' },
    L2: { displayName: 'Translated L2' },
    L3: { displayName: 'Translated L3' },
    L4: { displayName: 'Translated L4' },
    L5: { displayName: 'Translated L5' },
};

const config = {
    selector: 'sui-root',
    projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
    projectId: projectID,
    graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
    authToken: token,
    projectName: 'Layout translation',
    layoutTranslations,
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
            };
        },
    };
});

describe('Layout Translations Integration', () => {
    beforeEach(() => {
        render(<div id="sui-root" />);
    });

    it('should render translated layout display names in the dropdown', async () => {
        const user = userEvent.setup();
        await act(() => {
            StudioUI.studioUILoaderConfig(config);
        });

        await act(() => {
            window.StudioUISDK.config.events.onLayoutsChanged.trigger(mockLayouts);
            window.StudioUISDK.config.events.onSelectedLayoutIdChanged.trigger(mockLayout.id);
        });

        const layoutsContainer = screen.getByTestId(getDataTestIdForSUI('dropdown-available-layout'));
        const selectIndicator = layoutsContainer.getElementsByClassName('grafx-select__dropdown-indicator')[0];
        await user.click(selectIndicator);

        // Wait for the dropdown to appear and check for translated names
        await waitFor(() => {
            expect(screen.getAllByText('Translated L1')[0]).toBeInTheDocument(); // Selected Option
            expect(screen.getAllByText('Translated L1')[1]).toBeInTheDocument(); // Option in the Select
            expect(screen.getByText('Translated L2')).toBeInTheDocument();
            expect(screen.getByText('Translated L3')).toBeInTheDocument();
            expect(screen.getByText('Translated L4')).toBeInTheDocument();
            expect(screen.getByText('Translated L5')).toBeInTheDocument();
        });
    });
});
