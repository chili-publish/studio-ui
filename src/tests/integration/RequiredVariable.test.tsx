import '@tests/shared.util/sdk.mock';
import { act, render, waitFor, screen, fireEvent } from '@testing-library/react';
import { variables } from '@tests/mocks/mockVariables';
import axios from 'axios';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { mockOutputSetting, mockOutputSetting2 } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import { DateVariable, ImageVariable, ShortTextVariable, Variable, VariableType } from '@chili-publish/studio-sdk';
import userEvent from '@testing-library/user-event';
import selectEvent from 'react-select-event';
import { ListVariable as ListVariableType } from '@chili-publish/studio-sdk/lib/src/next';
import { getDataTestIdForSUI } from '../../utils/dataIds';
import StudioUI from '../../main';

const environmentBaseURL = 'http://abc.com';
const projectID = 'projectId';
const projectDownloadUrl = `${environmentBaseURL}/projects/${projectID}/document`;
const projectInfoUrl = `${environmentBaseURL}/projects/${projectID}`;
const token = 'auth-token';

const config = {
    selector: 'sui-root',
    projectDownloadUrl,
    projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
    projectId: projectID,
    graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
    authToken: token,
    projectName: '',
};

jest.mock('axios');
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
    const user = userEvent.setup();

    await user.click(screen.getByTestId('test-sui-navbar'));
    const variablesStr = JSON.stringify([{ ...variable, value: '', isRequired: true }]);

    await act(async () => {
        if (variable.type === VariableType.list) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (window.SDK as any).next.subscriber.onVariableListChanged(variablesStr);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (window.SDK as any).subscriber.onVariableListChanged(variablesStr);
        }
    });

    const downloadBtn = screen.getByRole('button', { name: 'Download' });
    expect(downloadBtn).toBeInTheDocument();

    await act(async () => {
        await user.click(downloadBtn);
    });

    const selectIndicator = screen
        .getByTestId(getDataTestIdForSUI(`output-dropdown`))
        .getElementsByClassName('grafx-drop-down__dropdown-indicator')[0];
    expect(selectIndicator).toBeInTheDocument();

    act(() => {
        selectEvent.openMenu(selectIndicator as unknown as HTMLElement);
    });

    const jpgOption = screen.getByText('JPG');
    await act(async () => {
        await user.click(jpgOption);
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

    beforeAll(() => {
        (axios.get as jest.Mock).mockImplementation((url) => {
            if (url === `${environmentBaseURL}/user-interfaces`)
                return Promise.resolve({ status: 200, data: { data: [mockUserInterface] } });
            if (url === `${environmentBaseURL}/output/settings`)
                return Promise.resolve({ status: 200, data: { data: [mockOutputSetting, mockOutputSetting2] } });
            if (url === projectDownloadUrl) return Promise.resolve({ data: {} });
            if (url === projectInfoUrl) return Promise.resolve({ data: mockProject });
            if (url === 'connectorSourceUrl') return Promise.resolve({ data: {} });

            return Promise.resolve({ data: {} });
        });
    });

    it('Should trigger text variable validation on blur', async () => {
        render(<div id="sui-root" />);
        act(() => {
            StudioUI.studioLoaderConfig(config);
        });

        await act(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (window.SDK as any).subscriber.onVariableListChanged(variablesStr);
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
            StudioUI.studioLoaderConfig(config);
        });

        await variableRequiredTest(listVariable);

        const selectIndicator = screen
            .getByTestId(getDataTestIdForSUI(`dropdown-${listVariable.id}`))
            .getElementsByClassName('grafx-drop-down__dropdown-indicator')[0];
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
            StudioUI.studioLoaderConfig(config);
        });

        await variableRequiredTest(dateVariable);

        expect(screen.getByText('This field is required')).toBeInTheDocument();
        const dateInput = screen.getByRole('textbox') as HTMLInputElement;
        await act(() => user.click(dateInput));

        await act(() => user.click(screen.getByText('15')));
        expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
    });

    it('Should trigger text variable validation when download is clicked', async () => {
        act(() => {
            render(<div id="sui-root" />);
        });
        act(() => {
            StudioUI.studioLoaderConfig(config);
        });

        await variableRequiredTest(textVariable);
    });

    it('Should trigger date variable validation when download is clicked', async () => {
        render(<div id="sui-root" />);
        act(() => {
            StudioUI.studioLoaderConfig(config);
        });

        await variableRequiredTest(dateVariable);
    });

    it('Should trigger list variable validation when download is clicked', async () => {
        render(<div id="sui-root" />);
        act(() => {
            StudioUI.studioLoaderConfig(config);
        });

        await variableRequiredTest(listVariable);
    });

    it('Should trigger image variable validation when download is clicked', async () => {
        render(<div id="sui-root" />);
        act(() => {
            StudioUI.studioLoaderConfig(config);
        });

        await variableRequiredTest(imageVariable);
    });
});
