import EditorSDK, {
    ImageVariable,
    SDKUnauthorizedError,
    UploadAssetValidationError,
    UploadAssetValidationErrorType,
} from '@chili-publish/studio-sdk';
import { act, waitFor } from '@testing-library/react';

// Real SDK error classes are required for instanceof checks inside the hook.
jest.unmock('@chili-publish/studio-sdk');
import { mock } from 'jest-mock-extended';
import { renderHookWithProviders } from '@tests/mocks/Provider';
import { TokenService } from 'src/services/TokenService';
import {
    uploadFileMimeTypes,
    useUploadAsset,
} from '../../../../components/variablesComponents/imageVariable/useUploadAsset';
import { variables as mockVariables } from '../../../mocks/mockVariables';

const mockSDK = mock<EditorSDK>();

describe('useUploadAsset', () => {
    const remoteConnectorId = 'remote-connector-1';
    const baseImageVariable = mockVariables[0] as ImageVariable;
    const testFile = new File(['file'], 'test.png', { type: 'image/png' });
    const validationConfiguration = { minWidthPixels: 100, minHeightPixels: 200 };
    const filePointers = [{ id: 'fp-1', name: 'test.png' }];
    const uploadedMedia = { id: 'media-123', name: 'test.png' };

    beforeEach(() => {
        window.StudioUISDK = mockSDK;
        mockSDK.utils.stageFiles = jest.fn().mockResolvedValue(filePointers);
        mockSDK.mediaConnector.upload = jest.fn().mockResolvedValue({ parsedData: [uploadedMedia] });

        (TokenService.getInstance as jest.Mock).mockReturnValue({
            refreshToken: jest.fn().mockResolvedValue('new-token'),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('stages files and uploads through the media connector on success', async () => {
        const { result } = renderHookWithProviders(() => useUploadAsset(remoteConnectorId, baseImageVariable));

        let uploadResult: unknown;
        await act(async () => {
            uploadResult = await result.current.upload([testFile], validationConfiguration);
        });

        expect(mockSDK.utils.stageFiles).toHaveBeenCalledWith([testFile], remoteConnectorId, {
            mimeTypes: uploadFileMimeTypes,
            ...validationConfiguration,
        });
        expect(mockSDK.mediaConnector.upload).toHaveBeenCalledWith(baseImageVariable.value!.connectorId, filePointers);
        expect(uploadResult).toEqual(uploadedMedia);
        expect(result.current.uploadError).toBeUndefined();
        expect(result.current.pending).toBe(false);
    });

    it.each([
        {
            uploadMinWidth: 800,
            uploadMinHeight: 600,
            expectedMessage: 'The image needs to be at least 800x600 px.',
        },
        {
            uploadMinWidth: 800,
            uploadMinHeight: undefined,
            expectedMessage: 'The image needs to be at least 800 px wide.',
        },
        {
            uploadMinWidth: undefined,
            uploadMinHeight: 600,
            expectedMessage: 'The image needs to be at least 600 px high.',
        },
        {
            uploadMinWidth: undefined,
            uploadMinHeight: undefined,
            expectedMessage: 'Something went wrong.',
        },
    ])(
        'maps min dimension validation errors ($expectedMessage)',
        async ({ uploadMinWidth, uploadMinHeight, expectedMessage }) => {
            (mockSDK.utils.stageFiles as jest.Mock).mockRejectedValue(
                new UploadAssetValidationError('File is too small', UploadAssetValidationErrorType.minDimension),
            );

            const imageVariable = {
                ...baseImageVariable,
                uploadMinWidth,
                uploadMinHeight,
            };

            const { result } = renderHookWithProviders(() => useUploadAsset(remoteConnectorId, imageVariable));

            await act(async () => {
                await result.current.upload([testFile], validationConfiguration);
            });

            expect(result.current.uploadError).toBe(expectedMessage);
        },
    );

    it('refreshes the token and retries staging when unauthorized', async () => {
        const refreshToken = jest.fn().mockResolvedValue('new-token');
        (TokenService.getInstance as jest.Mock).mockReturnValue({ refreshToken });

        (mockSDK.utils.stageFiles as jest.Mock)
            .mockRejectedValueOnce(new SDKUnauthorizedError('Unauthorized'))
            .mockResolvedValueOnce(filePointers);

        const { result } = renderHookWithProviders(() => useUploadAsset(remoteConnectorId, baseImageVariable));

        let uploadResult: unknown;
        await act(async () => {
            uploadResult = await result.current.upload([testFile], validationConfiguration);
        });

        expect(refreshToken).toHaveBeenCalledTimes(1);
        expect(mockSDK.utils.stageFiles).toHaveBeenCalledTimes(2);
        expect(mockSDK.mediaConnector.upload).toHaveBeenCalledWith(baseImageVariable.value!.connectorId, filePointers);
        expect(uploadResult).toEqual(uploadedMedia);
    });

    it('sets a generic upload error when media upload fails', async () => {
        (mockSDK.mediaConnector.upload as jest.Mock).mockRejectedValue(new Error('Upload failed'));

        const { result } = renderHookWithProviders(() => useUploadAsset(remoteConnectorId, baseImageVariable));

        let uploadResult: unknown;
        await act(async () => {
            uploadResult = await result.current.upload([testFile], validationConfiguration);
        });

        expect(uploadResult).toBeNull();
        expect(result.current.uploadError).toBe('Something went wrong.');
        expect(result.current.pending).toBe(false);
    });

    it('sets a generic upload error when staging throws a non-validation error', async () => {
        (mockSDK.utils.stageFiles as jest.Mock).mockRejectedValue(new Error('Network error'));

        const { result } = renderHookWithProviders(() => useUploadAsset(remoteConnectorId, baseImageVariable));

        let uploadResult: unknown;
        await act(async () => {
            uploadResult = await result.current.upload([testFile], validationConfiguration);
        });

        expect(uploadResult).toBeNull();
        expect(result.current.uploadError).toBe('Something went wrong.');
    });

    it('tracks pending state during upload', async () => {
        let resolveStageFiles: (value: typeof filePointers) => void = () => undefined;
        const stageFilesPromise = new Promise<typeof filePointers>((resolve) => {
            resolveStageFiles = resolve;
        });
        (mockSDK.utils.stageFiles as jest.Mock).mockReturnValue(stageFilesPromise);

        const { result } = renderHookWithProviders(() => useUploadAsset(remoteConnectorId, baseImageVariable));

        let uploadPromise: Promise<unknown>;
        act(() => {
            uploadPromise = result.current.upload([testFile], validationConfiguration);
        });

        await waitFor(() => {
            expect(result.current.pending).toBe(true);
        });

        await act(async () => {
            resolveStageFiles(filePointers);
            await uploadPromise;
        });

        expect(result.current.pending).toBe(false);
    });

    it('clears upload error at the start of a new upload', async () => {
        (mockSDK.utils.stageFiles as jest.Mock)
            .mockRejectedValueOnce(
                new UploadAssetValidationError('File is too small', UploadAssetValidationErrorType.minDimension),
            )
            .mockResolvedValueOnce(filePointers);

        const imageVariable = {
            ...baseImageVariable,
            uploadMinWidth: 800,
        };

        const { result } = renderHookWithProviders(() => useUploadAsset(remoteConnectorId, imageVariable));

        await act(async () => {
            await result.current.upload([testFile], validationConfiguration);
        });
        expect(result.current.uploadError).toBe('The image needs to be at least 800 px wide.');

        await act(async () => {
            await result.current.upload([testFile], validationConfiguration);
        });

        expect(result.current.uploadError).toBeUndefined();
        expect(result.current.pending).toBe(false);
    });

    it('clears upload error via resetUploadError', async () => {
        (mockSDK.utils.stageFiles as jest.Mock).mockRejectedValue(
            new UploadAssetValidationError('File is too small', UploadAssetValidationErrorType.minDimension),
        );

        const imageVariable = {
            ...baseImageVariable,
            uploadMinWidth: 800,
        };

        const { result } = renderHookWithProviders(() => useUploadAsset(remoteConnectorId, imageVariable));

        await act(async () => {
            await result.current.upload([testFile], validationConfiguration);
        });
        expect(result.current.uploadError).toBeDefined();

        act(() => {
            result.current.resetUploadError();
        });

        expect(result.current.uploadError).toBeUndefined();
    });
});
