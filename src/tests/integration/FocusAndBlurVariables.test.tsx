import '@tests/shared.util/sdk.mock';
import { act, render, waitFor, screen, fireEvent, within } from '@testing-library/react';
import { variables } from '@tests/mocks/mockVariables';
import axios from 'axios';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { mockOutputSetting, mockOutputSetting2 } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import { DateVariable, ImageVariable, NumberVariable, ShortTextVariable } from '@chili-publish/studio-sdk';
import userEvent from '@testing-library/user-event';
import { ListVariable as ListVariableType } from '@chili-publish/studio-sdk/lib/src/next';
import { getDataTestIdForSUI } from '../../utils/dataIds';
import StudioUI from '../../main';

const environmentBaseURL = 'http://abc.com';
const projectID = 'projectId';
const projectDownloadUrl = `${environmentBaseURL}/projects/${projectID}/document`;
const projectInfoUrl = `${environmentBaseURL}/projects/${projectID}`;
const token = 'auth-token';

const variableFocusFn = jest.fn();
const variableBlurFn = jest.fn();

const config = {
    selector: 'sui-root',
    projectDownloadUrl,
    projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
    projectId: projectID,
    graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
    authToken: token,
    projectName: '',
    onVariableFocus: (id: string) => variableFocusFn(id),
    onVariableBlur: (id: string) => variableBlurFn(id),
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

    window.IntersectionObserver = jest.fn(
        () =>
            ({
                observe: jest.fn(),
                unobserve: jest.fn(),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any),
    );
});

afterAll(() => {
    HTMLDivElement.prototype.animate = originalAnimateFunction;
});

jest.mock('../../components/variablesComponents/imageVariable/useVariableConnector', () => ({
    useVariableConnector: () => ({
        selectedConnector: {
            id: 'some-id',
            type: 'media',
            scriptSource: 'defaultMedia',
            supportedAuthentication: {
                browser: ['none'],
            },
        },
    }),
}));

describe('Required text variable', () => {
    const user = userEvent.setup();
    const textVariable = variables.find((item) => item.id === 'shortVariable 1') as ShortTextVariable;
    const dateVariable = variables.find((item) => item.id === 'date-variable') as DateVariable;
    const listVariable = variables.find((item) => item.id === '10') as ListVariableType;
    const imageVariable = variables.find((item) => item.id === 'variable1') as ImageVariable;
    const numberVariable = variables.find((item) => item.id === 'number-variable') as NumberVariable;
    const booleanVariable = variables.find((item) => item.id === 'boolean-var-id') as NumberVariable;
    const variablesStr = JSON.stringify(variables);

    beforeEach(async () => {
        (axios.get as jest.Mock).mockImplementation((url) => {
            if (url === `${environmentBaseURL}/user-interfaces`)
                return Promise.resolve({ status: 200, data: { data: [mockUserInterface] } });
            if (url === `${environmentBaseURL}/user-interfaces/${mockUserInterface.id}`)
                return Promise.resolve({ status: 200, data: mockUserInterface });
            if (url === `${environmentBaseURL}/output/settings`)
                return Promise.resolve({ status: 200, data: { data: [mockOutputSetting, mockOutputSetting2] } });
            if (url === projectDownloadUrl) return Promise.resolve({ data: {} });
            if (url === projectInfoUrl) return Promise.resolve({ data: mockProject });
            return Promise.resolve({ data: {} });
        });
        render(<div id="sui-root" />);
        await act(() => {
            StudioUI.studioUILoaderConfig(config);
        });
        await act(async () => {
            await (window.StudioUISDK as any).next.subscriber.onVariableListChanged(variablesStr);
        });
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should call onVariableFocus and onVariableBlur with correct data when a "Text" variable is focused or blurred', async () => {
        const input = screen.getAllByDisplayValue(textVariable.value)[0];
        await act(async () => {
            await user.type(input, 'Something');
        });
        expect(variableFocusFn).toHaveBeenCalledWith(textVariable.id);

        act(() => {
            fireEvent.blur(input);
        });

        expect(variableBlurFn).toHaveBeenCalledWith(textVariable.id);
    });

    it('Should call onVariableFocus and onVariableBlur with correct data when a "Number" variable is focused or blurred', async () => {
        const input = screen.getByDisplayValue(numberVariable.value);
        await act(async () => {
            await user.type(input, '123');
        });
        expect(variableFocusFn).toHaveBeenCalledWith(numberVariable.id);

        act(() => {
            fireEvent.blur(input);
        });

        expect(variableBlurFn).toHaveBeenCalledWith(numberVariable.id);
    });

    it('Should call onVariableFocus and onVariableBlur with correct data when a "Date" variable is focused or blurred', async () => {
        const formattedDate = `${dateVariable.value?.split('-').slice(1).join('/')}/${
            dateVariable.value?.split('-')[0]
        }`;

        const dateInput = screen.getByDisplayValue(formattedDate as string);

        await act(async () => {
            await user.click(dateInput);
            await user.click(dateInput);
        });

        expect(variableFocusFn).toHaveBeenCalledWith(dateVariable.id);
    });

    it('Should call onVariableFocus and onVariableBlur with correct data when a "Boolean" variable is changed', async () => {
        const bool = screen.getByRole('checkbox', {
            name: booleanVariable.label as string,
        });
        await act(async () => {
            await user.click(bool);
        });
        expect(variableFocusFn).toHaveBeenCalledWith(booleanVariable.id);
        expect(variableBlurFn).toHaveBeenCalledWith(booleanVariable.id);
    });

    it('Should call onVariableFocus and onVariableBlur with correct data when a "List" variable is changed', async () => {
        const selectIndicator = screen
            .getByTestId(getDataTestIdForSUI(`dropdown-${listVariable.id}`))
            .getElementsByClassName('grafx-select__dropdown-indicator')[0];

        await act(async () => {
            await user.click(selectIndicator);
        });

        expect(variableFocusFn).toHaveBeenCalledWith(listVariable.id);

        // This was commented in purpose until the SDK is fixed, seems like window.SDK.subscriber.onVariableListChanged
        // is not formatting list variable items correctly
        await waitFor(async () => {
            const option = screen.getByText(/val 1/i);
            await act(async () => {
                await user.click(option);
            });
        });
        expect(variableBlurFn).toHaveBeenCalledWith(listVariable.id);
    });

    it('Should call onVariableFocus and onVariableBlur with correct data when a "Image" variable is changed', async () => {
        const imagePickerContainer = screen.getByTestId('test-sui-img-picker-variable1');
        const imageIcon = within(imagePickerContainer).getByRole('img', {
            hidden: true,
        });
        await act(async () => {
            await user.click(imageIcon);
        });
        expect(variableFocusFn).toHaveBeenCalledWith(imageVariable.id);
    });
});
