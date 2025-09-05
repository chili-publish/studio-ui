import '@tests/mocks/sdk.mock';
import {
    DateVariable,
    ImageVariable,
    ShortTextVariable,
    Variable,
    VariableType,
    LayoutIntent,
    LayoutPropertiesType,
} from '@chili-publish/studio-sdk';
import { ListVariable as ListVariableType } from '@chili-publish/studio-sdk/lib/src/next';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { variables } from '@tests/mocks/mockVariables';
import selectEvent from 'react-select-event';
import StudioUI from '../../main';
import { getDataTestIdForSUI } from '../../utils/dataIds';
import { createMockEnvironmentClientApis, mockEnvironmentClientApiModule } from '../mocks/environmentClientApi';

const environmentBaseURL = 'http://abc.com';
const projectID = 'projectId';
const token = 'auth-token';

// Mock environment client APIs for testing
const mockEnvironmentClientApis = createMockEnvironmentClientApis();

const config = {
    selector: 'sui-root',
    projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
    projectId: projectID,
    graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
    authToken: token,
    projectName: '',
    userInterfaceID: mockUserInterface.id,
    onFetchUserInterfaceDetails: () => Promise.resolve(mockUserInterface),
    environmentClientApis: mockEnvironmentClientApis,
};

jest.mock('axios');

// Mock the entire environment client API module
mockEnvironmentClientApiModule();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let originalAnimateFunction: any;

beforeAll(() => {
    originalAnimateFunction = HTMLDivElement.prototype.animate;

    const obj = {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onfinish: () => {},
    };

    const animationFunction = () => {
        Promise.resolve().then(async () => {
            act(() => obj.onfinish());
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return obj as any;
    };

    HTMLDivElement.prototype.animate = animationFunction;
});

afterAll(() => {
    HTMLDivElement.prototype.animate = originalAnimateFunction;
});

const variableRequiredTest = async (variable: Variable) => {
    act(() => {
        window.StudioUISDK.config.events.onSelectedLayoutPropertiesChanged.trigger({
            intent: { value: LayoutIntent.digitalAnimated },
            timelineLengthMs: { value: 0 },
        } as unknown as LayoutPropertiesType);
    });

    const user = userEvent.setup();

    await user.click(screen.getByTestId('test-sui-navbar'));
    const variablesStr = JSON.stringify([{ ...variable, value: '', isRequired: true }]);

    await act(async () => {
        if (variable.type === VariableType.list) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (window.StudioUISDK as any).next.subscriber.onVariableListChanged(variablesStr);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (window.StudioUISDK as any).subscriber.onVariableListChanged(variablesStr);
        }
    });

    const downloadBtn = screen.getByRole('button', { name: 'Download' });
    expect(downloadBtn).toBeInTheDocument();

    await act(async () => {
        await user.click(downloadBtn);
    });

    const selectIndicator = screen
        .getByTestId(getDataTestIdForSUI(`output-dropdown`))
        .getElementsByClassName('grafx-select__dropdown-indicator')[0];
    expect(selectIndicator).toBeInTheDocument();

    act(() => {
        selectEvent.openMenu(selectIndicator as unknown as HTMLElement);
    });

    const jpgOptions = screen.getAllByText(/jpg/i);
    await act(async () => {
        await user.click(jpgOptions[0]);
    });

    const panelDownloadButton = screen.getByTestId(getDataTestIdForSUI(`download-btn`));
    await act(async () => {
        await user.click(panelDownloadButton);
    });
    await waitFor(() => {
        expect(screen.getByText('Fill all required fields to download.')).toBeInTheDocument();
        expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
};

describe('Required text variable', () => {
    const user = userEvent.setup();
    const textVariable = variables.find((item) => item.id === 'shortVariable 1') as ShortTextVariable;
    const dateVariable = variables.find((item) => item.id === 'date-variable') as DateVariable;
    const listVariable = variables.find((item) => item.id === '10') as ListVariableType;
    const imageVariable = variables.find((item) => item.id === 'variable1') as ImageVariable;
    const variablesStr = JSON.stringify([{ ...textVariable, isRequired: true }]);

    it('Should render variables if variables form builder is active', async () => {
        const { rerender } = render(<div id="sui-root" />);
        act(() => {
            StudioUI.studioUILoaderConfig({
                ...config,
                onFetchUserInterfaceDetails: () =>
                    Promise.resolve({
                        ...mockUserInterface,
                        formBuilder: [
                            mockUserInterface.formBuilder[0], // data source
                            mockUserInterface.formBuilder[1], // layouts
                            {
                                id: 'Variables',
                                type: 'variables',
                                active: false,
                                header: 'Variables',
                                helpText: 'Variables help text',
                            },
                        ],
                    }),
            });
        });
        const variablesHeader = mockUserInterface.formBuilder.find((item) => item.type === 'variables')?.header;
        await waitFor(() => {
            expect(screen.queryByText(`${variablesHeader}`)).not.toBeInTheDocument();
        });
        rerender(<div id="sui-root" />);
        act(() => {
            StudioUI.studioUILoaderConfig(config);
        });
        await waitFor(() => {
            expect(screen.getByText(`${variablesHeader}`)).toBeInTheDocument();
        });
    });

    it('Should trigger text variable validation on blur', async () => {
        render(<div id="sui-root" />);
        act(() => {
            StudioUI.studioUILoaderConfig(config);
        });

        await act(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (window.StudioUISDK as any).subscriber.onVariableListChanged(variablesStr);
        });

        await waitFor(() => {
            expect(screen.getByDisplayValue(textVariable.value)).toBeInTheDocument();
        });

        expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
        const input = screen.getByDisplayValue(textVariable.value);
        await act(async () => {
            await user.clear(input);
        });

        act(() => {
            fireEvent.blur(input);
        });

        await waitFor(() => {
            expect(screen.getByText('This field is required')).toBeInTheDocument();
        });
    });

    it('Should validate list variable', async () => {
        render(<div id="sui-root" />);
        act(() => {
            StudioUI.studioUILoaderConfig(config);
        });

        await variableRequiredTest(listVariable);

        const selectIndicator = screen
            .getByTestId(getDataTestIdForSUI(`dropdown-${listVariable.id}`))
            .getElementsByClassName('grafx-select__dropdown-indicator')[0];
        expect(selectIndicator).toBeInTheDocument();

        act(() => {
            selectEvent.openMenu(selectIndicator as unknown as HTMLElement);
        });

        await waitFor(() => {
            expect(screen.getByText(listVariable.items[1].value)).toBeInTheDocument();
        });

        const option = screen.getByText(listVariable.items[1].value);
        expect(screen.getByText('This field is required')).toBeInTheDocument();
        await act(async () => {
            await user.click(option);
        });
        expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
    });

    it('Should validate date variable', async () => {
        render(<div id="sui-root" />);
        act(() => {
            StudioUI.studioUILoaderConfig(config);
        });

        await variableRequiredTest(dateVariable);

        expect(screen.getByText('This field is required')).toBeInTheDocument();
        const dateInput = screen.getByRole('textbox') as HTMLInputElement;
        await user.click(dateInput);

        await user.click(screen.getByText('15'));

        expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
    });

    it('Should trigger text variable validation when download is clicked', async () => {
        act(() => {
            render(<div id="sui-root" />);
        });
        act(() => {
            StudioUI.studioUILoaderConfig(config);
        });

        await variableRequiredTest(textVariable);
    });

    it('Should trigger date variable validation when download is clicked', async () => {
        render(<div id="sui-root" />);
        act(() => {
            StudioUI.studioUILoaderConfig(config);
        });

        await variableRequiredTest(dateVariable);
    });

    it('Should trigger list variable validation when download is clicked', async () => {
        render(<div id="sui-root" />);
        act(() => {
            StudioUI.studioUILoaderConfig(config);
        });

        await variableRequiredTest(listVariable);
    });

    it('Should trigger image variable validation when download is clicked', async () => {
        render(<div id="sui-root" />);
        act(() => {
            StudioUI.studioUILoaderConfig(config);
        });

        await variableRequiredTest(imageVariable);
    });
});
