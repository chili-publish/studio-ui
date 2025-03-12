/* eslint-disable @typescript-eslint/no-explicit-any, react/no-array-index-key */
import SDK, { DataRowAsyncError, VariableType } from '@chili-publish/studio-sdk';
import { ToastVariant } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';
import { useCallback, useEffect } from 'react';
import { useNotificationManager } from './contexts/NotificantionManager/NotificationManagerContext';

const DATA_SOURCE_TOAST_ID = 'data-source-toast';
const varTypesWithNoValue = [VariableType.number, VariableType.boolean];

const BoldText = styled.span`
    font-weight: bold;
`;

export const useDataRowExceptionHandler = (sdkRef?: SDK) => {
    const { addNotification, removeNotifications } = useNotificationManager();

    const handleRowExceptions = useCallback(
        async (asyncError: DataRowAsyncError) => {
            asyncError.exceptions
                .filter((item) => !!item)
                .forEach((exception) => {
                    let msg;
                    const variableInfo = exception.context;
                    if (
                        exception.code === 403104 ||
                        (exception.code === 403062 && variableInfo.variableType === VariableType.image)
                    ) {
                        msg = (
                            <>
                                <BoldText>{variableInfo?.variableLabel ?? variableInfo?.variableName}</BoldText> is
                                invalid. The value is cleared.
                            </>
                        );
                    }
                    if (
                        exception.code === 403032 ||
                        (exception.code === 403105 &&
                            variableInfo.variableType &&
                            varTypesWithNoValue.includes(variableInfo.variableType))
                    ) {
                        msg = (
                            <>
                                <BoldText>{variableInfo?.variableLabel ?? variableInfo?.variableName}</BoldText> is
                                invalid. A default value is used.
                            </>
                        );
                    }
                    if (msg) {
                        addNotification({
                            id: `${DATA_SOURCE_TOAST_ID}-${variableInfo.variableId}`,
                            message: msg as any,
                            type: ToastVariant.NEGATIVE,
                        });
                    }
                });
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

    return {
        handleRowExceptions,
    };
};
