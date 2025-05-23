import { ImagePicker, UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ImageVariable from '../../../../components/variablesComponents/imageVariable/ImageVariable';
import { useMediaDetails } from '../../../../components/variablesComponents/imageVariable/useMediaDetails';
import { usePreviewImageUrl } from '../../../../components/variablesComponents/imageVariable/usePreviewImageUrl';
import { useUploadAsset } from '../../../../components/variablesComponents/imageVariable/useUploadAsset';
import { useVariableConnector } from '../../../../components/variablesComponents/imageVariable/useVariableConnector';
import { useFeatureFlagContext } from '../../../../contexts/FeatureFlagProvider';
import { useVariablePanelContext } from '../../../../contexts/VariablePanelContext';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../../utils/dataIds';
import { variables } from '../../../mocks/mockVariables';

jest.mock('../../../../components/variablesComponents/imageVariable/useVariableConnector', () => ({
    useVariableConnector: jest.fn().mockReturnValue({ remoteConnector: null }),
}));

jest.mock('../../../../contexts/VariablePanelContext', () => ({
    useVariablePanelContext: jest.fn().mockReturnValue({ showImagePanel: jest.fn() }),
}));

jest.mock('../../../../components/variablesComponents/imageVariable/usePreviewImageUrl', () => ({
    usePreviewImageUrl: jest.fn().mockReturnValue({ previewImageUrl: 'http://image-url.com', pending: false }),
}));

jest.mock('../../../../components/variablesComponents/imageVariable/useMediaDetails', () => ({
    useMediaDetails: jest.fn().mockReturnValue({
        id: 'mediaId',
        name: 'mediaName',
        extension: 'png',
    }),
}));

jest.mock('../../../../components/variablesComponents/imageVariable/useUploadAsset', () => ({
    uploadFileMimeTypes: ['image/jpg' as const, 'image/jpeg' as const, 'image/png' as const],
    useUploadAsset: jest.fn().mockReturnValue({
        upload: jest.fn().mockImplementation(() => Promise.resolve(null)),
        pending: false,
        uploadError: undefined,
        resetUploadError: jest.fn(),
    }),
}));

jest.mock('../../../../contexts/FeatureFlagProvider', () => ({
    useFeatureFlagContext: jest.fn().mockReturnValue({
        featureFlags: {
            studioImageUpload: true,
        },
    }),
}));

jest.mock('@chili-publish/grafx-shared-components', () => {
    const original = jest.requireActual('@chili-publish/grafx-shared-components');
    return {
        ...original,
        ImagePicker: jest.fn((props) => (
            <>
                <div data-testid="pending-state">{props.pending ? 'Loading...' : 'Not loading'}</div>
                <button data-testid="remove-button" type="button" onClick={props.onRemove} />
                {props.onBrowse && <button data-testid="browse-button" type="button" onClick={props.onBrowse} />}
                {props.onUpload && (
                    <button
                        data-testid="upload-button"
                        type="button"
                        onClick={() => {
                            props.onUpload([new File(['file'], 'test.png', { type: 'image/png' })]);
                        }}
                    />
                )}
            </>
        )),
    };
});

describe('"ImageVariable" component ', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should not render anything when both allowQuery and allowUpload are false', () => {
        (useFeatureFlagContext as jest.Mock).mockReturnValueOnce({
            featureFlags: {
                studioImageUpload: true,
            },
        });

        const imageVariable = {
            ...variables[0],
            allowQuery: false,
            allowUpload: false,
        };

        const { container } = render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(container.innerHTML).toBe('');
        expect(ImagePicker).not.toHaveBeenCalled();
    });

    it('should display help text', () => {
        (useMediaDetails as jest.Mock).mockReturnValueOnce(null);
        const helpText = 'helpText info';
        const imageVariable = {
            ...variables[0],
            helpText,
        };
        render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(screen.getByText(helpText)).toBeInTheDocument();
    });

    it('should produce "undefined" preview image if no media details are available', () => {
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

    it('should produce "undefined" preview image if no previewImageUrl is available', () => {
        (usePreviewImageUrl as jest.Mock).mockReturnValueOnce({ previewImageUrl: null, pending: false });
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

    it('should handle "remove" event correctly', async () => {
        const handleRemove = jest.fn();
        const imageVariable = variables[0];
        render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariable} handleImageRemove={handleRemove} />
            </UiThemeProvider>,
        );

        fireEvent.click(screen.getByTestId('remove-button'));

        expect(handleRemove).toHaveBeenCalled();
    });

    it('should handle "browse" with required authentication', async () => {
        (useVariableConnector as jest.Mock).mockReturnValueOnce({
            remoteConnector: { supportedAuthentication: { browser: ['oAuth2AuthorizationCode'] } },
        });
        window.StudioUISDK.mediaConnector.query = jest.fn().mockResolvedValueOnce({});
        const showImagePanel = jest.fn();
        (useVariablePanelContext as jest.Mock).mockReturnValueOnce({ showImagePanel });
        const imageVariable = variables[0];

        render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />
            </UiThemeProvider>,
        );

        fireEvent.click(screen.getByTestId('browse-button'));

        await waitFor(() => {
            expect(showImagePanel).toHaveBeenCalledWith(imageVariable);
        });
    });

    it('should handle "browse" without required authentication', async () => {
        (useVariableConnector as jest.Mock).mockReturnValueOnce({
            remoteConnector: { supportedAuthentication: { browser: [] } },
        });
        const showImagePanel = jest.fn();
        (useVariablePanelContext as jest.Mock).mockReturnValueOnce({ showImagePanel });
        const imageVariable = variables[0];

        render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />
            </UiThemeProvider>,
        );

        fireEvent.click(screen.getByTestId('browse-button'));

        await waitFor(() => {
            expect(showImagePanel).toHaveBeenCalledWith(imageVariable);
        });
    });

    it('should display the configured placeholder', async () => {
        const PLACEHOLDER = 'Placeholder text';
        const imageVariable = {
            ...variables[0],
            placeholder: PLACEHOLDER,
        };

        render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(ImagePicker).toHaveBeenCalledWith(
            expect.objectContaining({
                placeholder: PLACEHOLDER,
            }),
            {},
        );
    });

    it('should display label as variable label if label is empty string', () => {
        const imageVariable = {
            ...variables[0],
            label: '',
        };

        render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />
            </UiThemeProvider>,
        );

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
        const imageVariable = variables[0];

        render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />
            </UiThemeProvider>,
        );

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
        const imageVariableWithoutLabel = {
            ...variables[0],
            label: undefined,
        };

        render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariableWithoutLabel} handleImageRemove={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(ImagePicker).toHaveBeenCalledWith(
            expect.objectContaining({
                label: expect.objectContaining({
                    props: {
                        translationKey: imageVariableWithoutLabel.name,
                        value: imageVariableWithoutLabel.name,
                    },
                }),
            }),
            {},
        );
    });

    it('should include onUpload prop when allowUpload is true and feature flag is enabled', () => {
        const imageVariable = {
            ...variables[0],
            allowUpload: true,
        };
        const handleImageChange = jest.fn();

        render(
            <UiThemeProvider theme="platform">
                <ImageVariable
                    variable={imageVariable}
                    handleImageRemove={jest.fn()}
                    handleImageChange={handleImageChange}
                />
            </UiThemeProvider>,
        );

        expect(screen.getByTestId('upload-button')).toBeInTheDocument();
    });

    it('should not include onUpload prop when allowUpload is false', () => {
        const imageVariable = variables[0];
        const handleImageChange = jest.fn();

        render(
            <UiThemeProvider theme="platform">
                <ImageVariable
                    variable={imageVariable}
                    handleImageRemove={jest.fn()}
                    handleImageChange={handleImageChange}
                />
            </UiThemeProvider>,
        );

        expect(screen.queryByTestId('upload-button')).not.toBeInTheDocument();
    });

    it('should not include onUpload prop when feature flag is disabled', () => {
        (useFeatureFlagContext as jest.Mock).mockReturnValueOnce({
            featureFlags: {
                studioImageUpload: false,
            },
        });

        const imageVariable = {
            ...variables[0],
            allowUpload: true,
            allowQuery: true,
        };
        const handleImageChange = jest.fn();

        render(
            <UiThemeProvider theme="platform">
                <ImageVariable
                    variable={imageVariable}
                    handleImageRemove={jest.fn()}
                    handleImageChange={handleImageChange}
                />
            </UiThemeProvider>,
        );

        expect(screen.queryByTestId('upload-button')).not.toBeInTheDocument();
    });

    it('should handle upload when successful', async () => {
        const imageVariable = {
            ...variables[0],
            allowUpload: true,
            allowQuery: true,
        };
        const handleImageChange = jest.fn();
        const uploadMock = jest.fn().mockResolvedValue({ id: 'media-123' });

        (useUploadAsset as jest.Mock).mockReturnValue({
            upload: uploadMock,
            pending: false,
            errorMsg: undefined,
        });

        render(
            <UiThemeProvider theme="platform">
                <ImageVariable
                    variable={imageVariable}
                    handleImageRemove={jest.fn()}
                    handleImageChange={handleImageChange}
                />
            </UiThemeProvider>,
        );

        fireEvent.click(screen.getByTestId('upload-button'));

        await waitFor(() => {
            expect(uploadMock).toHaveBeenCalled();
            expect(handleImageChange).toHaveBeenCalledWith({ assetId: 'media-123', id: imageVariable.id });
        });
    });

    it('should include onBrowse prop when allowQuery is true', () => {
        const imageVariable = variables[0];

        render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(screen.getByTestId('browse-button')).toBeInTheDocument();
    });

    it('should not include onBrowse prop when allowQuery is false', () => {
        const imageVariable = {
            ...variables[0],
            allowQuery: false,
        };

        render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(screen.queryByTestId('browse-button')).not.toBeInTheDocument();
    });

    it('should show pending state when previewPending is true', () => {
        (usePreviewImageUrl as jest.Mock).mockReturnValue({ previewImageUrl: 'http://image-url.com', pending: true });

        const imageVariable = variables[0];

        render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(screen.getByTestId('pending-state')).toHaveTextContent('Loading...');
    });

    it('should show pending state when uploadPending is true', () => {
        (useUploadAsset as jest.Mock).mockReturnValue({
            upload: jest.fn().mockImplementation(() => Promise.resolve(null)),
            pending: true,
            errorMsg: undefined,
        });

        const imageVariable = variables[0];

        render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(screen.getByTestId('pending-state')).toHaveTextContent('Loading...');
    });

    it('should call resetUploadError when browsing images', async () => {
        (useVariableConnector as jest.Mock).mockReturnValueOnce({
            remoteConnector: { supportedAuthentication: { browser: [] } },
        });
        const resetUploadError = jest.fn();
        (useUploadAsset as jest.Mock).mockReturnValue({
            upload: jest.fn(),
            pending: false,
            uploadError: undefined,
            resetUploadError,
        });

        const imageVariable = variables[0];

        render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />
            </UiThemeProvider>,
        );

        fireEvent.click(screen.getByTestId('browse-button'));

        expect(resetUploadError).toHaveBeenCalled();
    });

    it('should call resetUploadError when removing image', () => {
        const resetUploadError = jest.fn();
        (useUploadAsset as jest.Mock).mockReturnValue({
            upload: jest.fn(),
            pending: false,
            uploadError: undefined,
            resetUploadError,
        });

        const imageVariable = variables[0];

        render(
            <UiThemeProvider theme="platform">
                <ImageVariable variable={imageVariable} handleImageRemove={jest.fn()} />
            </UiThemeProvider>,
        );

        fireEvent.click(screen.getByTestId('remove-button'));

        expect(resetUploadError).toHaveBeenCalled();
    });
});
