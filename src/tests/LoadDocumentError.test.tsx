import { LayoutIntent } from '@chili-publish/studio-sdk';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import MainContent from '../MainContent';
import AppProvider from '../contexts/AppProvider';
import { SubscriberContextProvider } from '../contexts/Subscriber';
import { ProjectConfig } from '../types/types';
import { Subscriber } from '../utils/subscriber';
import { renderWithProviders } from './mocks/Provider';

const onUserInterfaceBackMock = jest.fn();
const projectConfig = {
    onUserInterfaceBack: onUserInterfaceBackMock(),
    projectId: 'projectId',
    projectName: 'projectName',
    onProjectInfoRequested: () => Promise.resolve({ projectId: '1' }),
    onProjectDocumentRequested: () => Promise.resolve({ docId: '1' }),
    onProjectLoaded: () => null,
    onProjectSave: () => null,
    onAuthenticationRequested: () => 'authToken',
    onAuthenticationExpired: () => null,
    onLogInfoRequested: () => null,
    onProjectGetDownloadLink: () => null,
    outputSettings: {},
    uiOptions: {},
} as unknown as ProjectConfig;

jest.mock('@chili-publish/studio-sdk', () => {
    const originalModule = jest.requireActual('@chili-publish/studio-sdk');
    return {
        __esModule: true,
        ...originalModule,
        /* eslint-disable */
        default: function () {
            /* eslint-enable */
            return {
                loadEditor: () => '',
                configuration: { setValue: jest.fn() },
                next: {
                    connector: {
                        getAllByType: jest
                            .fn()
                            .mockImplementation(() => Promise.resolve({ success: true, parsedData: [] })),
                    },
                },
                layout: {
                    getSelected: jest
                        .fn()
                        .mockImplementation(() =>
                            Promise.resolve({ parsedData: { intent: { value: LayoutIntent.print } } }),
                        ),
                },
                document: {
                    load: jest
                        .fn()
                        .mockImplementation()
                        .mockRejectedValue({ cause: { name: '303001' } }),
                },
                tool: { setHand: jest.fn() },
                canvas: { zoomToPage: jest.fn() },
                animation: { pause: jest.fn() },
                dataSource: { getDataSource: jest.fn().mockResolvedValue({ parsedData: null }) },
            };
        },
    };
});

describe('LoadDocumentError', () => {
    it('Shows a dialog when load document errors because of selected engine version being lower than the one in the document', async () => {
        const user = userEvent.setup();
        await act(async () => {
            await renderWithProviders(
                <AppProvider isDocumentLoaded>
                    <SubscriberContextProvider subscriber={new Subscriber()}>
                        <MainContent updateToken={jest.fn()} projectConfig={projectConfig} />
                    </SubscriberContextProvider>
                </AppProvider>,
            );
        });

        const dialogTitle = screen.getByText(/incompatible project/i);
        const closeBtn = screen.getByRole('button', {
            name: /close/i,
        });
        expect(dialogTitle).toBeInTheDocument();
        expect(closeBtn).toBeInTheDocument();
        await act(() => {
            user.click(closeBtn);
        });
        expect(onUserInterfaceBackMock).toHaveBeenCalled();
    });
});
