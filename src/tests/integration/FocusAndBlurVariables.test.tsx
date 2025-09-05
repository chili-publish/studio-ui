import '@tests/mocks/sdk.mock';
import { DateVariable, ImageVariable, NumberVariable, ShortTextVariable } from '@chili-publish/studio-sdk';
import { ListVariable as ListVariableType } from '@chili-publish/studio-sdk/lib/src/next';
import { mockOutputSetting, mockOutputSetting2 } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import { mockUserInterface, mockApiUserInterface } from '@mocks/mockUserinterface';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { variables } from '@tests/mocks/mockVariables';
import StudioUI from '../../main';
import { getDataTestIdForSUI } from '../../utils/dataIds';
import { createMockEnvironmentClientApis } from '../mocks/environmentClientApi';

// Mock the entire environment client API module at the top level
jest.mock('@chili-publish/environment-client-api', () => ({
    ConnectorsApi: jest.fn().mockImplementation(() => ({})),
    ProjectsApi: jest.fn().mockImplementation(() => ({
        apiV1EnvironmentEnvironmentProjectsProjectIdGet: jest.fn().mockResolvedValue(mockProject),
        apiV1EnvironmentEnvironmentProjectsProjectIdDocumentGet: jest
            .fn()
            .mockResolvedValue({ data: '{"test": "document"}' }),
        apiV1EnvironmentEnvironmentProjectsProjectIdDocumentPut: jest.fn().mockResolvedValue({ success: true }),
    })),
    UserInterfacesApi: jest.fn().mockImplementation(() => ({
        apiV1EnvironmentEnvironmentUserInterfacesGet: jest.fn().mockResolvedValue({ data: [mockApiUserInterface] }),
        apiV1EnvironmentEnvironmentUserInterfacesUserInterfaceIdGet: jest.fn().mockResolvedValue(mockApiUserInterface),
    })),
    SettingsApi: jest.fn().mockImplementation(() => ({})),
    OutputApi: jest.fn().mockImplementation(() => ({
        apiV1EnvironmentEnvironmentOutputSettingsGet: jest
            .fn()
            .mockResolvedValue({ data: [mockOutputSetting, mockOutputSetting2] }),
    })),
    Configuration: jest.fn().mockImplementation(() => ({})),
}));

const environmentBaseURL = 'http://abc.com';
const projectID = 'projectId';
const token = 'auth-token';

// Mock environment client APIs for testing
const mockEnvironmentClientApis = createMockEnvironmentClientApis();

const variableFocusFn = jest.fn();
const variableBlurFn = jest.fn();

const config = {
    selector: 'sui-root',
    // projectDownloadUrl, // Force use of environment client API
    projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
    projectId: projectID,
    graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
    authToken: token,
    projectName: '',
    onVariableFocus: (id: string) => variableFocusFn(id),
    onVariableBlur: (id: string) => variableBlurFn(id),
    onFetchUserInterfaceDetails: () => Promise.resolve(mockUserInterface),
    userInterfaceID: mockUserInterface.id,
    environmentClientApis: mockEnvironmentClientApis,
};

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
            }) as any,
    );
});

afterAll(() => {
    HTMLDivElement.prototype.animate = originalAnimateFunction;
});

jest.mock('../../components/variablesComponents/imageVariable/useVariableConnector', () => ({
    useVariableConnector: () => ({
        remoteConnector: {
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
        render(<div id="sui-root" />);
        await act(() => {
            StudioUI.studioUILoaderConfig(config);
        });
        await act(async () => {
            await window.StudioUISDK.next.subscriber.onVariableListChanged(variablesStr);
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
