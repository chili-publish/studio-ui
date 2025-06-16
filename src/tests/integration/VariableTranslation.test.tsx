import '@tests/mocks/sdk.mock';
import {
    BooleanVariable,
    DateVariable,
    ImageVariable,
    NumberVariable,
    ShortTextVariable,
} from '@chili-publish/studio-sdk';
import { ListVariable as ListVariableType } from '@chili-publish/studio-sdk/lib/src/next';
import { mockOutputSetting, mockOutputSetting2 } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { act, render, screen, within } from '@testing-library/react';
import { variables, variables as mockVariables } from '@tests/mocks/mockVariables';
import axios from 'axios';
import { VariableTranslations } from 'src/types/VariableTranslations';
import StudioUI from '../../main';
import { getDataTestIdForSUI } from '../../utils/dataIds';
import userEvent from '@testing-library/user-event';

const environmentBaseURL = 'http://abc.com';
const projectID = 'projectId';
const projectDownloadUrl = `${environmentBaseURL}/projects/${projectID}/document`;
const projectInfoUrl = `${environmentBaseURL}/projects/${projectID}`;
const token = 'auth-token';

const mockTranslations: VariableTranslations = {
    'Short Variable 1': {
        label: 'Translated Short Text',
        placeholder: 'Enter translated text',
        helpText: 'This is translated help text',
    },
    'Date Variable 1 Label': {
        label: 'Translated Date',
        placeholder: 'Select translated date',
        helpText: 'This is translated date help',
    },
    'List label': {
        label: 'Translated List',
        placeholder: 'Select translated option',
        helpText: 'This is translated list help',
        listItems: {
            'Val 1': 'Translated Val 1',
        },
    },
    'Variable1 Label': {
        label: 'Translated Image',
        placeholder: 'Select translated image',
        helpText: 'This is translated image help',
    },
    'Number Variable 1 Label': {
        label: 'Translated Number',
        placeholder: 'Enter translated number',
        helpText: 'This is translated number help',
    },
    'Test boolean': {
        label: 'Translated Boolean',
        placeholder: 'Select translated boolean',
        helpText: 'This is translated boolean help',
    },
};

const config = {
    selector: 'sui-root',
    projectDownloadUrl,
    projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
    projectId: projectID,
    graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
    authToken: token,
    projectName: '',
    userInterfaceID: mockUserInterface.id,
    onFetchUserInterfaceDetails: () => Promise.resolve(mockUserInterface),
    variableTranslations: mockTranslations,
    variables: mockVariables,
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

describe('Variable Translations', () => {
    const user = userEvent.setup();
    const textVariable = variables.find((item) => item.id === 'shortVariable 1') as ShortTextVariable;
    const dateVariable = variables.find((item) => item.id === 'date-variable') as DateVariable;
    const listVariable = variables.find((item) => item.id === '10') as ListVariableType;
    const imageVariable = variables.find((item) => item.id === 'variable1') as ImageVariable;
    const numberVariable = variables.find((item) => item.id === 'number-variable') as NumberVariable;
    const booleanVariable = variables.find((item) => item.id === 'boolean-var-id') as BooleanVariable;

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
            await window.StudioUISDK.config.events.onVariableListChanged.trigger(variables);
        });
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should render translated text variable', async () => {
        const translation = mockTranslations[textVariable.label!];
        const input = screen.getByTestId(getDataTestIdForSUI(`input-${textVariable.id}`));

        expect(screen.getByText(translation.label!)).toBeInTheDocument();
        expect(screen.getByText(translation.helpText!)).toBeInTheDocument();
        expect(input).toHaveAttribute('placeholder', translation.placeholder);
    });

    it('Should render translated date variable', async () => {
        const translation = mockTranslations[dateVariable.label!];
        const datePicker = screen.getByTestId(getDataTestIdForSUI(`${dateVariable.id}-variable-date-picker`));
        const input = datePicker.querySelector('input');

        expect(within(datePicker).getByText(translation.label!)).toBeInTheDocument();
        expect(screen.getByText(translation.helpText!)).toBeInTheDocument();
        expect(input).toHaveAttribute('placeholder', translation.placeholder);
    });

    it('Should render translated list variable with translated items', async () => {
        const translation = mockTranslations[listVariable.label!];
        const select = screen.getByTestId(getDataTestIdForSUI(`dropdown-${listVariable.id}`));

        expect(within(select).getByText(translation.label!)).toBeInTheDocument();
        expect(screen.getByText(translation.helpText!)).toBeInTheDocument();
        expect(within(select).getByText(translation.placeholder!)).toBeInTheDocument();

        const selectIndicator = select.getElementsByClassName('grafx-select__dropdown-indicator')[0];
        await act(async () => {
            await user.click(selectIndicator);
        });

        expect(screen.getByText('Translated Val 1')).toBeInTheDocument();
    });

    it('Should render translated image variable', async () => {
        const translation = mockTranslations[imageVariable.label!];
        const imagePicker = screen.getByTestId(getDataTestIdForSUI(`img-picker-${imageVariable.id}`));

        expect(within(imagePicker).getByText(translation.label!)).toBeInTheDocument();
        expect(screen.getByText(translation.helpText!)).toBeInTheDocument();
        expect(within(imagePicker).getByText(translation.placeholder!)).toBeInTheDocument();
    });

    it('Should render translated number variable', async () => {
        const translation = mockTranslations[numberVariable.label!];

        expect(screen.getByText(translation.label!)).toBeInTheDocument();
        expect(screen.getByText(translation.helpText!)).toBeInTheDocument();
    });

    it('Should render translated boolean variable', async () => {
        const translation = mockTranslations[booleanVariable.label!];

        expect(screen.getByText(translation.label!)).toBeInTheDocument();
        expect(screen.getByText(translation.helpText!)).toBeInTheDocument();
    });
});
