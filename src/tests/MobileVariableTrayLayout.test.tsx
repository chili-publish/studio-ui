/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import EditorSDK, { ConnectorRegistrationSource, LayoutPropertiesType } from '@chili-publish/studio-sdk';
import { mockLayout, mockLayouts } from '@mocks/mockLayout';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import MobileVariablesPanel from '../components/variables/MobileVariablesTray';
import FeatureFlagProvider from '../contexts/FeatureFlagProvider';
import { getDataIdForSUI } from '../utils/dataIds';
import { variables } from './mocks/mockVariables';
import { APP_WRAPPER } from './shared.util/app';

afterEach(() => {
    jest.clearAllMocks();
});
const mockSDK = mock<EditorSDK>();
const mockDataSource = {
    id: 'data-source',
    name: 'Goodle sheets',
    iconUrl: '',
    source: { source: ConnectorRegistrationSource.url, url: '' },
};

jest.mock('../contexts/AppProvider', () => ({
    useAppContext: () => ({
        dataSource: mockDataSource,
    }),
}));

jest.mock('../utils/connectors', () => ({
    getRemoteConnector: jest.fn().mockResolvedValue({
        supportedAuthentication: {
            browser: [],
        },
    }),
    isAuthenticationRequired: () => false,
}));

describe('MobileVariableTrayLayout', () => {
    mockSDK.layout.select = jest.fn().mockResolvedValue({
        parsedData: null,
    });
    mockSDK.dataConnector.getPage = jest.fn().mockResolvedValue({
        parsedData: { page: { data: [] } },
    });
    mockSDK.undoManager.addCustomData = jest.fn();
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    mockSDK.next.connector = {} as any;

    mockSDK.next.connector.getById = jest.fn().mockResolvedValue({
        parsedData: {
            source: { url: 'http://deploy.com/data-connector', source: ConnectorRegistrationSource.url },
        },
    });
    window.StudioUISDK = mockSDK;

    it('Layout is the title of the tray when no data source is available', async () => {
        render(
            <UiThemeProvider theme="platform">
                <MobileVariablesPanel
                    variables={variables}
                    selectedLayout={mockLayout}
                    layouts={mockLayouts}
                    layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                    layoutSectionUIOptions={{
                        visible: true,
                        layoutSwitcherVisible: true,
                        title: 'Layout',
                    }}
                />
            </UiThemeProvider>,
            { container: document.body.appendChild(APP_WRAPPER) },
        );

        const openTrayBtn = screen.getByRole('button');

        await userEvent.click(openTrayBtn);
        await waitFor(() => expect(screen.getByTestId('test-gsc-tray-header')).toBeInTheDocument());

        expect(screen.getByRole('heading', { name: /layout/i })).toBeInTheDocument();
        expect(screen.getByText('Customize')).toBeInTheDocument();
    });

    it('Data source is the title of the tray when available', async () => {
        render(
            <UiThemeProvider theme="platform">
                <FeatureFlagProvider featureFlags={{ studioDataSource: true }}>
                    <MobileVariablesPanel
                        variables={variables}
                        selectedLayout={mockLayout}
                        layouts={mockLayouts}
                        layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                        layoutSectionUIOptions={{
                            visible: true,
                            layoutSwitcherVisible: true,
                            title: 'Layout',
                        }}
                    />
                </FeatureFlagProvider>
            </UiThemeProvider>,
            { container: document.body.appendChild(APP_WRAPPER) },
        );

        const openTrayBtn = screen.getByRole('button');

        await userEvent.click(openTrayBtn);

        expect(screen.getByTestId('test-gsc-tray-header')).toHaveTextContent('Data source');
        expect(screen.getByText('Layout')).toBeInTheDocument();
        expect(screen.getByText('Customize')).toBeInTheDocument();
    });

    it('Change selected layout is available', async () => {
        render(
            <UiThemeProvider theme="platform">
                <MobileVariablesPanel
                    variables={variables}
                    selectedLayout={mockLayout}
                    layouts={mockLayouts}
                    layoutPropertiesState={mockLayout as unknown as LayoutPropertiesType}
                    layoutSectionUIOptions={{
                        visible: true,
                        layoutSwitcherVisible: true,
                        title: 'Layout',
                    }}
                />
            </UiThemeProvider>,
            { container: document.body.appendChild(APP_WRAPPER) },
        );

        const openTrayBtn = screen.getByRole('button');

        await userEvent.click(openTrayBtn);

        expect(screen.getByTestId('test-gsc-tray-header')).toHaveTextContent('Layout');

        const layoutsDropdown = screen.getByTestId(getDataIdForSUI(`dropdown-available-layout`));
        expect(layoutsDropdown).toBeInTheDocument();

        await userEvent.click(layoutsDropdown);

        await waitFor(() => {
            expect(screen.queryByText(mockLayouts[0].name)).not.toBeInTheDocument();
            expect(screen.getByText(mockLayouts[1].displayName!)).toBeInTheDocument();
            // layout does not have display name
            expect(screen.getByText(mockLayouts[2].name)).toBeInTheDocument();
            expect(screen.getByText(mockLayouts[3].displayName!)).toBeInTheDocument();
        });

        await act(async () => {
            await userEvent.click(screen.getByText(mockLayouts[1].displayName!));
        });

        await waitFor(() => {
            expect(window.StudioUISDK.layout.select).toHaveBeenCalledWith(mockLayouts[1].id);
        });
    });
});
