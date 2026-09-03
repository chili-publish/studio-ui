/* eslint-disable @typescript-eslint/no-explicit-any */
import SDK, { DataRowAsyncError, Variable } from '@chili-publish/studio-sdk';
import { ToastVariant } from '@chili-publish/grafx-shared-components';
import { useCallback, useEffect } from 'react';
import { useNotificationManager } from '../contexts/NotificantionManager/NotificationManagerContext';
import { dataSourceErrorHandler } from 'src/utils/dataSourceErrorHandler';

const DATA_SOURCE_TOAST_ID = 'data-source-toast';

type ExceptionWithVariableInfo = { exception: DataRowAsyncError['exceptions'][0]; variableData: Variable | null };

export const useDataRowExceptionHandler = (sdkRef?: SDK) => {
    const { addNotification, removeNotifications } = useNotificationManager();

    const handleRowExceptions = useCallback(
        async (asyncError: DataRowAsyncError) => {
            const exceptionsWithVariableInfoPromises = asyncError.exceptions
                .filter((item) => !!item)
                .filter((exception) => exception.code !== 104004)
                .map(async (exception) => {
                    const variableInfo = exception.context;
                    const variableId = variableInfo?.variableId;
                    if (!variableId) return null;
                    const variableData = (await window.StudioUISDK.variable.getById(variableId)).parsedData;

                    return { exception, variableData };
                });

            const exceptionsWithVariableInfo: ExceptionWithVariableInfo[] = (await Promise.all(
                exceptionsWithVariableInfoPromises,
            )) as ExceptionWithVariableInfo[];

            exceptionsWithVariableInfo
                .filter((data) => !!data)
                .forEach(({ exception, variableData }) => {
                    const msg = dataSourceErrorHandler(
                        { errorCode: exception.code, columnName: exception.context?.columnName },
                        variableData,
                    );
                    if (msg) {
                        addNotification({
                            id: `${DATA_SOURCE_TOAST_ID}-${variableData?.id}`,
                            message: msg as any,
                            type: ToastVariant.NEGATIVE,
                        });
                    }
                });

            const unhandledExceptions: string = asyncError.exceptions
                // engine code for unhandled exceptions
                .filter((exception) => exception.code === 104004)
                .map((exception) => exception.message)
                .join(`\n`);
            if (unhandledExceptions) throw new Error(unhandledExceptions);
        },
        [addNotification],
    );

    useEffect(() => {
        const unsubscriber = sdkRef?.config?.events?.onAsyncError.registerCallback((exception) => {
            if (exception instanceof DataRowAsyncError) {
                removeNotifications(`${DATA_SOURCE_TOAST_ID}-`);
                handleRowExceptions(exception);
            }
        });
        return () => {
            unsubscriber?.();
        };
    }, [sdkRef, handleRowExceptions, removeNotifications]);
};
