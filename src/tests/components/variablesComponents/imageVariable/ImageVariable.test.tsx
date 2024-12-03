import { ImagePicker, UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import ImageVariable from '../../../../components/variablesComponents/imageVariable/ImageVariable';
import { useMediaDetails } from '../../../../components/variablesComponents/imageVariable/useMediaDetails';
import { usePreviewImageUrl } from '../../../../components/variablesComponents/imageVariable/usePreviewImageUrl';
import { useVariableConnector } from '../../../../components/variablesComponents/imageVariable/useVariableConnector';
import { useVariablePanelContext } from '../../../../contexts/VariablePanelContext';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../../utils/dataIds';
import { variables } from '../../../mocks/mockVariables';

jest.mock('../../../../components/variablesComponents/imageVariable/useVariableConnector', () => ({
    useVariableConnector: jest.fn().mockReturnValue({ selectedConnector: null }),
}));

jest.mock('../../../../contexts/VariablePanelContext', () => ({
    useVariablePanelContext: jest.fn().mockReturnValue({ showImagePanel: jest.fn() }),
}));

jest.mock('../../../../components/variablesComponents/imageVariable/usePreviewImageUrl', () => ({
    usePreviewImageUrl: jest.fn().mockReturnValue('http://image-url.com'),
}));

jest.mock('../../../../components/variablesComponents/imageVariable/useMediaDetails', () => ({
    useMediaDetails: jest.fn().mockReturnValue({
        id: 'mediaId',
        name: 'mediaName',
        extension: 'png',
    }),
}));

jest.mock('@chili-publish/grafx-shared-components', () => {
    const original = jest.requireActual('@chili-publish/grafx-shared-components');
    return {
        ...original,
        ImagePicker: jest.fn((props) => (
            <>
                <button id="remove" type="button" onClick={props.onRemove} />
                <button id="browse" type="button" onClick={props.onBrowse} />
            </>
        )),
    };
});

jest.mock('../../../../contexts/FeatureFlagProvider', () => ({
    useFeatureFlagContext: () => ({
        featureFlags: {
            STUDIO_LABEL_PROPERTY_ENABLED: true,
        },
    }),
}));

describe('"ImageVariable" component ', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should display help text', () => {
        (useMediaDetails as jest.Mock).mockReturnValueOnce(null);
        const helpText = 'helpText info';
        const imageVariable = { ...variables[0], helpText };
        render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(screen.getByText(helpText)).toBeInTheDocument();
    });

    it('should produce "undefined" preview image if not media details are available', () => {
        (useMediaDetails as jest.Mock).mockReturnValueOnce(null);
        const imageVariable = variables[0];
        render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(ImagePicker).toHaveBeenCalledWith(
            expect.objectContaining({
                dataId: getDataIdForSUI(`img-picker-${imageVariable.id}`),
                dataTestId: getDataTestIdForSUI(`img-picker-${imageVariable.id}`),
                dataIntercomId: `image-picker-${imageVariable.name}`,
                id: imageVariable.id,
                placeholder: 'Select image',
                errorMsg: 'Something went wrong. Please try again',
                previewImage: undefined,
                onRemove: expect.any(Function),
                onBrowse: expect.any(Function),
            }),
            {},
        );
    });

    it('should produce "undefined" preview image if not previewImageUrl is available', () => {
        (usePreviewImageUrl as jest.Mock).mockReturnValueOnce(null);
        const imageVariable = variables[0];
        render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(ImagePicker).toHaveBeenCalledWith(
            expect.objectContaining({
                dataId: getDataIdForSUI(`img-picker-${imageVariable.id}`),
                dataTestId: getDataTestIdForSUI(`img-picker-${imageVariable.id}`),
                dataIntercomId: `image-picker-${imageVariable.name}`,
                id: imageVariable.id,
                placeholder: 'Select image',
                errorMsg: 'Something went wrong. Please try again',
                previewImage: undefined,
                onRemove: expect.any(Function),
                onBrowse: expect.any(Function),
            }),
            {},
        );
    });

    it('should produce full preview image if both previewImageUrl and mediaDetails are available', () => {
        const imageVariable = variables[0];
        render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(ImagePicker).toHaveBeenCalledWith(
            expect.objectContaining({
                dataId: getDataIdForSUI(`img-picker-${imageVariable.id}`),
                dataTestId: getDataTestIdForSUI(`img-picker-${imageVariable.id}`),
                dataIntercomId: `image-picker-${imageVariable.name}`,
                id: imageVariable.id,
                placeholder: 'Select image',
                errorMsg: 'Something went wrong. Please try again',
                previewImage: {
                    id: 'mediaId',
                    name: 'mediaName',
                    format: 'png',
                    url: 'http://image-url.com',
                },
                onRemove: expect.any(Function),
                onBrowse: expect.any(Function),
            }),
            {},
        );
    });

    it('should handle "remove" event correctly', () => {
        const handleRemove = jest.fn();
        const imageVariable = variables[0];
        const { container } = render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariable} handleImageRemove={handleRemove} />
            </UiThemeProvider>,
        );

        expect(ImagePicker).toHaveBeenCalledWith(
            expect.objectContaining({
                dataId: getDataIdForSUI(`img-picker-${imageVariable.id}`),
                dataTestId: getDataTestIdForSUI(`img-picker-${imageVariable.id}`),
                dataIntercomId: `image-picker-${imageVariable.name}`,
                id: imageVariable.id,
                placeholder: 'Select image',
                errorMsg: 'Something went wrong. Please try again',
                previewImage: {
                    id: 'mediaId',
                    name: 'mediaName',
                    format: 'png',
                    url: 'http://image-url.com',
                },
                onRemove: expect.any(Function),
                onBrowse: expect.any(Function),
            }),
            {},
        );

        container.querySelector<HTMLButtonElement>('#remove')?.click();

        act(() => {
            expect(handleRemove).toHaveBeenCalled();
        });
    });

    // TODO: Find a way of how to test throwing of error for event
    xit('should handle "browse" when no selected connector (exceptional case)', async () => {
        const showImagePanel = jest.fn();
        (useVariablePanelContext as jest.Mock).mockReturnValueOnce({ showImagePanel });
        const imageVariable = variables[0];
        const { container } = render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(ImagePicker).toHaveBeenCalledWith(
            expect.objectContaining({
                dataId: getDataIdForSUI(`img-picker-${imageVariable.id}`),
                dataTestId: getDataTestIdForSUI(`img-picker-${imageVariable.id}`),
                dataIntercomId: `image-picker-${imageVariable.name}`,
                id: imageVariable.id,
                placeholder: 'Select image',
                errorMsg: 'Something went wrong. Please try again',
                previewImage: {
                    id: 'mediaId',
                    name: 'mediaName',
                    format: 'png',
                    url: 'http://image-url.com',
                },
                onRemove: expect.any(Function),
                onBrowse: expect.any(Function),
            }),
            {},
        );

        await expect(async () => {
            const btn = container.querySelector<HTMLButtonElement>('#browse');
            if (btn) {
                fireEvent.click(btn);
            }
        }).rejects.toThrow('There is no selected connector');
    });

    it('should handle "browse" with required authentication', async () => {
        (useVariableConnector as jest.Mock).mockReturnValueOnce({
            selectedConnector: { supportedAuthentication: { browser: ['oAuth2AuthorizationCode'] } },
        });
        window.StudioUISDK.mediaConnector.query = jest.fn().mockResolvedValueOnce({});
        const showImagePanel = jest.fn();
        (useVariablePanelContext as jest.Mock).mockReturnValueOnce({ showImagePanel });
        const imageVariable = variables[0];
        const { container } = render(<ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />);

        expect(ImagePicker).toHaveBeenCalledWith(
            expect.objectContaining({
                dataId: getDataIdForSUI(`img-picker-${imageVariable.id}`),
                dataTestId: getDataTestIdForSUI(`img-picker-${imageVariable.id}`),
                dataIntercomId: `image-picker-${imageVariable.name}`,
                id: imageVariable.id,
                placeholder: 'Select image',
                errorMsg: 'Something went wrong. Please try again',
                previewImage: {
                    id: 'mediaId',
                    name: 'mediaName',
                    format: 'png',
                    url: 'http://image-url.com',
                },
                onRemove: expect.any(Function),
                onBrowse: expect.any(Function),
            }),
            {},
        );

        container.querySelector<HTMLButtonElement>('#browse')?.click();

        act(() => {
            expect(window.StudioUISDK.mediaConnector.query).toHaveBeenCalledWith('grafx-media', {});
        });

        await waitFor(() => expect(showImagePanel).toHaveBeenCalledWith(imageVariable));
    });

    it('should handle "browse" without required authentication', async () => {
        (useVariableConnector as jest.Mock).mockReturnValueOnce({
            selectedConnector: { supportedAuthentication: { browser: [] } },
        });
        window.StudioUISDK.mediaConnector.query = jest.fn().mockResolvedValueOnce({});
        const showImagePanel = jest.fn();
        (useVariablePanelContext as jest.Mock).mockReturnValueOnce({ showImagePanel });
        const imageVariable = variables[0];
        const { container } = render(<ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />);

        expect(ImagePicker).toHaveBeenCalledWith(
            expect.objectContaining({
                dataId: getDataIdForSUI(`img-picker-${imageVariable.id}`),
                dataTestId: getDataTestIdForSUI(`img-picker-${imageVariable.id}`),
                dataIntercomId: `image-picker-${imageVariable.name}`,
                id: imageVariable.id,
                placeholder: 'Select image',
                errorMsg: 'Something went wrong. Please try again',
                previewImage: {
                    id: 'mediaId',
                    name: 'mediaName',
                    format: 'png',
                    url: 'http://image-url.com',
                },
                onRemove: expect.any(Function),
                onBrowse: expect.any(Function),
            }),
            {},
        );

        container.querySelector<HTMLButtonElement>('#browse')?.click();

        act(() => {
            expect(window.StudioUISDK.mediaConnector.query).not.toHaveBeenCalledWith('grafx-media', {});
        });

        await waitFor(() => expect(showImagePanel).toHaveBeenCalledWith(imageVariable));
    });

    it('should display the configured placeholder', async () => {
        const handleRemoveFn = jest.fn();
        const showImagePanel = jest.fn();

        const PLACEHOLDER = 'Placeholder text';
        const imageVariable = { ...variables[0], placeholder: PLACEHOLDER };

        window.StudioUISDK.mediaConnector.query = jest.fn().mockResolvedValueOnce({});
        (useVariablePanelContext as jest.Mock).mockReturnValueOnce({ showImagePanel });

        render(<ImageVariable variable={imageVariable} handleImageRemove={handleRemoveFn} />);

        expect(ImagePicker).toHaveBeenCalledWith(
            expect.objectContaining({
                placeholder: PLACEHOLDER,
            }),
            {},
        );
    });

    it('should display label as variable label if label is empty string', () => {
        const imageVariable = { ...variables[0], label: '' };
        window.StudioUISDK.mediaConnector.query = jest.fn().mockResolvedValueOnce({});
        (useVariablePanelContext as jest.Mock).mockReturnValueOnce({ showImagePanel: jest.fn() });
        render(<ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />);

        expect(ImagePicker).toHaveBeenCalledWith(
            expect.objectContaining({
                label: expect.objectContaining({
                    props: {
                        translationKey: imageVariable.label,
                        value: imageVariable.label,
                    },
                }),
            }),
            {},
        );
    });

    it('should display label as variable label', () => {
        const imageVariable = { ...variables[0] };
        window.StudioUISDK.mediaConnector.query = jest.fn().mockResolvedValueOnce({});
        (useVariablePanelContext as jest.Mock).mockReturnValueOnce({ showImagePanel: jest.fn() });
        render(<ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />);

        expect(ImagePicker).toHaveBeenCalledWith(
            expect.objectContaining({
                label: expect.objectContaining({
                    props: {
                        translationKey: imageVariable.label,
                        value: imageVariable.label,
                    },
                }),
            }),
            {},
        );
    });
    it('should display variable name as variable label if label does not exist', () => {
        const imageVariable = { ...variables[0] };
        delete (imageVariable as unknown as { [key: string]: string }).label;
        window.StudioUISDK.mediaConnector.query = jest.fn().mockResolvedValueOnce({});
        (useVariablePanelContext as jest.Mock).mockReturnValueOnce({ showImagePanel: jest.fn() });
        render(<ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />);

        expect(ImagePicker).toHaveBeenCalledWith(
            expect.objectContaining({
                label: expect.objectContaining({
                    props: {
                        translationKey: imageVariable.name,
                        value: imageVariable.name,
                    },
                }),
            }),
            {},
        );
    });
});
