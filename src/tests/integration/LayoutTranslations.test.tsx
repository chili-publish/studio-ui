import { act, render, screen, waitFor } from '@testing-library/react';
import { mockLayout, mockLayouts } from '@mocks/mockLayout';
import { ConfigType } from '@chili-publish/studio-sdk';
import { getDataTestIdForSUI } from 'src/utils/dataIds';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import StudioUI from '../../main';

jest.mock('@chili-publish/studio-sdk');
jest.mock('axios');

const environmentBaseURL = 'http://abc.com';
const projectID = 'projectId';
const projectDownloadUrl = `${environmentBaseURL}/projects/${projectID}/document`;
const token = 'token';

const layoutTranslations = {
    'L1 display name': { displayName: 'Translated L1' }, // layout displayName available and used
    L2: { displayName: 'Translated L2' }, // layout displayName null name is used
    'L3 display name': { displayName: 'Translated L3' }, // layout displayName available and used
    L4: { displayName: 'Translated L4' }, // layout displayName is undefined
    L5: { displayName: 'Translated L5' }, // layout displayName is empty string
};

const config = {
    selector: 'sui-root',
    projectDownloadUrl,
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
                        .mockImplementation(() => Promise.resolve({ sucess: true, parsedData: mockLayout })),
                },
            };
        },
    };
});

describe('Layout Translations Integration', () => {
    beforeEach(() => {
        (axios.get as jest.Mock).mockImplementation(() => {
            return Promise.resolve({ data: [] });
        });
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

        // // Also check that original names are not present if a translation exists
        expect(screen.queryByText('L1 display name')).not.toBeInTheDocument();
        expect(screen.queryByText('L2')).not.toBeInTheDocument();
        expect(screen.queryByText('L3 display name')).not.toBeInTheDocument();
        expect(screen.queryByText('L4')).not.toBeInTheDocument();
        expect(screen.queryByText('L5')).not.toBeInTheDocument();
    });

    it('should fallback to original name/displayName if no translation exists', async () => {
        const user = userEvent.setup();

        const partialTranslations = {
            'L1 display name': { displayName: 'Translated L1' },
        };

        await act(() => {
            StudioUI.studioUILoaderConfig({ ...config, layoutTranslations: partialTranslations });
        });
        await act(() => {
            window.StudioUISDK.config.events.onLayoutsChanged.trigger(mockLayouts);
            window.StudioUISDK.config.events.onSelectedLayoutIdChanged.trigger(mockLayout.id);
        });

        const layoutsContainer = screen.getByTestId(getDataTestIdForSUI('dropdown-available-layout'));
        const selectIndicator = layoutsContainer.getElementsByClassName('grafx-select__dropdown-indicator')[0];
        await user.click(selectIndicator);

        await waitFor(() => {
            expect(screen.getAllByText('Translated L1')).toHaveLength(2);
            // L2, L3, L4, L5 should fallback to their original displayName or name
            expect(screen.getByText('L2')).toBeInTheDocument();
            expect(screen.getByText('L3 display name')).toBeInTheDocument();
            expect(screen.getByText('L4')).toBeInTheDocument();
            expect(screen.getByText('L5')).toBeInTheDocument();
        });
    });
});
