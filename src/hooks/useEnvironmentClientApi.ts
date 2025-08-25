import { useCallback } from 'react';
import {
    GenerateGifOutputRequest,
    GenerateJpgOutputRequest,
    GenerateMp4OutputRequest,
    GeneratePdfOutputRequest,
    GeneratePngOutputRequest,
    JsonNode,
} from '@chili-publish/environment-client-api';
import { useEnvironmentApiContext } from '../contexts/EnvironmentApiProvider';

export function useEnvironmentClientApi() {
    const { apisRef, environment } = useEnvironmentApiContext();

    // Connectors API methods
    const getConnectors = useCallback(async () => {
        if (!apisRef.current.connectorsApi) {
            throw new Error('Connectors API not initialized');
        }

        const result = await apisRef.current.connectorsApi.apiV1EnvironmentEnvironmentConnectorsGet({
            environment,
        });
        return result;
    }, [apisRef, environment]);

    const getConnectorById = useCallback(
        async (connectorId: string) => {
            if (!apisRef.current.connectorsApi) {
                throw new Error('Connectors API not initialized');
            }
            const result = await apisRef.current.connectorsApi.apiV1EnvironmentEnvironmentConnectorsConnectorIdGet({
                environment,
                connectorId,
            });
            return result;
        },
        [apisRef, environment],
    );

    // Projects API methods
    const getProjectById = useCallback(
        async (projectId: string) => {
            if (!apisRef.current.projectsApi) {
                throw new Error('Projects API not initialized');
            }

            const result = await apisRef.current.projectsApi.apiV1EnvironmentEnvironmentProjectsProjectIdGet({
                environment,
                projectId,
            });
            return result;
        },
        [apisRef, environment],
    );

    const getProjectDocument = useCallback(
        async (projectId: string) => {
            if (!apisRef.current.projectsApi) {
                throw new Error('Projects API not initialized');
            }

            const result = await apisRef.current.projectsApi.apiV1EnvironmentEnvironmentProjectsProjectIdDocumentGet({
                environment,
                projectId,
            });
            return result;
        },
        [apisRef, environment],
    );

    const updateProjectDocument = useCallback(
        async (projectId: string, documentContent: { [key: string]: JsonNode }) => {
            if (!apisRef.current.projectsApi) {
                throw new Error('Projects API not initialized');
            }

            const result = await apisRef.current.projectsApi.apiV1EnvironmentEnvironmentProjectsProjectIdDocumentPut({
                environment,
                projectId,
                requestBody: documentContent,
            });
            return result;
        },
        [apisRef, environment],
    );

    // User Interfaces API methods
    const getUserInterfaces = useCallback(async () => {
        if (!apisRef.current.userInterfacesApi) {
            throw new Error('User Interfaces API not initialized');
        }

        const result = await apisRef.current.userInterfacesApi.apiV1EnvironmentEnvironmentUserInterfacesGet({
            environment,
        });
        return result;
    }, [apisRef, environment]);

    const getUserInterfaceById = useCallback(
        async (userInterfaceId: string) => {
            if (!apisRef.current.userInterfacesApi) {
                throw new Error('User Interfaces API not initialized');
            }

            const result =
                await apisRef.current.userInterfacesApi.apiV1EnvironmentEnvironmentUserInterfacesUserInterfaceIdGet({
                    environment,
                    userInterfaceId,
                });
            return result;
        },
        [apisRef, environment],
    );

    // Output Settings API methods
    const getOutputSettings = useCallback(async () => {
        if (!apisRef.current.outputApi) {
            throw new Error('Output API not initialized');
        }

        const result = await apisRef.current.outputApi.apiV1EnvironmentEnvironmentOutputSettingsGet({
            environment,
        });
        return result;
    }, [apisRef, environment]);

    const getOutputSettingById = useCallback(
        async (outputSettingsId: string) => {
            if (!apisRef.current.outputApi) {
                throw new Error('Output API not initialized');
            }

            const result = await apisRef.current.outputApi.apiV1EnvironmentEnvironmentOutputSettingsOutputSettingsIdGet(
                {
                    environment,
                    outputSettingsId,
                },
            );
            return result;
        },
        [apisRef, environment],
    );

    // Output generation methods
    const generatePngOutput = useCallback(
        async (requestBody: GeneratePngOutputRequest) => {
            if (!apisRef.current.outputApi) {
                throw new Error('Output API not initialized');
            }

            const result = await apisRef.current.outputApi.apiV1EnvironmentEnvironmentOutputPngPost({
                environment,
                generatePngOutputRequest: requestBody,
            });
            return result;
        },
        [apisRef, environment],
    );

    const generateJpgOutput = useCallback(
        async (requestBody: GenerateJpgOutputRequest) => {
            if (!apisRef.current.outputApi) {
                throw new Error('Output API not initialized');
            }

            const result = await apisRef.current.outputApi.apiV1EnvironmentEnvironmentOutputJpgPost({
                environment,
                generateJpgOutputRequest: requestBody,
            });
            return result;
        },
        [apisRef, environment],
    );

    const generatePdfOutput = useCallback(
        async (requestBody: GeneratePdfOutputRequest) => {
            if (!apisRef.current.outputApi) {
                throw new Error('Output API not initialized');
            }

            const result = await apisRef.current.outputApi.apiV1EnvironmentEnvironmentOutputPdfPost({
                environment,
                generatePdfOutputRequest: requestBody,
            });
            return result;
        },
        [apisRef, environment],
    );

    const generateMp4Output = useCallback(
        async (requestBody: GenerateMp4OutputRequest) => {
            if (!apisRef.current.outputApi) {
                throw new Error('Output API not initialized');
            }

            const result = await apisRef.current.outputApi.apiV1EnvironmentEnvironmentOutputMp4Post({
                environment,
                generateMp4OutputRequest: requestBody,
            });
            return result;
        },
        [apisRef, environment],
    );

    const generateGifOutput = useCallback(
        async (requestBody: GenerateGifOutputRequest) => {
            if (!apisRef.current.outputApi) {
                throw new Error('Output API not initialized');
            }

            const result = await apisRef.current.outputApi.apiV1EnvironmentEnvironmentOutputGifPost({
                environment,
                generateGifOutputRequest: requestBody,
            });
            return result;
        },
        [apisRef, environment],
    );

    // Task status methods
    const getTaskStatus = useCallback(
        async (taskId: string) => {
            if (!apisRef.current.outputApi) {
                throw new Error('Output API not initialized');
            }

            const result = await apisRef.current.outputApi.apiV1EnvironmentEnvironmentOutputTasksTaskIdGet({
                environment,
                taskId,
            });
            return result;
        },
        [apisRef, environment],
    );

    const getTaskDownload = useCallback(
        async (taskId: string) => {
            if (!apisRef.current.outputApi) {
                throw new Error('Output API not initialized');
            }

            const result = await apisRef.current.outputApi.apiV1EnvironmentEnvironmentOutputTasksTaskIdDownloadGet({
                environment,
                taskId,
            });
            return result;
        },
        [apisRef, environment],
    );

    return {
        // Connectors
        getConnectors,
        getConnectorById,

        // Projects
        getProjectById,
        getProjectDocument,
        updateProjectDocument,

        // User Interfaces
        getUserInterfaces,
        getUserInterfaceById,

        // Output Settings
        getOutputSettings,
        getOutputSettingById,

        // Output Generation
        generatePngOutput,
        generateJpgOutput,
        generatePdfOutput,
        generateMp4Output,
        generateGifOutput,

        // Task Management
        getTaskStatus,
        getTaskDownload,
    };
}
