/* eslint-disable @typescript-eslint/no-explicit-any, react/no-array-index-key */
import SDK, { DataRowAsyncError, VariableType } from '@chili-publish/studio-sdk';
import { ToastVariant } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';
import { useCallback, useEffect, useRef } from 'react';
import { useNotificationManager } from './contexts/NotificantionManager/NotificationManagerContext';
import { DATA_SOURCE_TOAST_ID } from './contexts/NotificantionManager/Notification.styles';
import { SELECTED_ROW_INDEX_KEY } from './components/dataSource/useDataSource';

export const DATA_SOURCE_NOTIFICATION_ID = 'data-source-validation-msg';
const varTypesWithNoValue = [VariableType.number, VariableType.boolean];

const BoldText = styled.span`
    font-weight: bold;
`;

export const useDataRowExceptionHandler = (sdkRef?: SDK) => {
    const { addNotification } = useNotificationManager();
    const selectedDataSourceRow = useRef<string>();

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
                            id: `${DATA_SOURCE_TOAST_ID}-${selectedDataSourceRow.current}-${variableInfo.variableId}`,
                            message: msg as any,
                            type: ToastVariant.NEGATIVE,
                        });
                    }
                });
        },
        [addNotification],
    );

    useEffect(() => {
        const unsubscriber = sdkRef?.config?.events?.onCustomUndoDataChanged.registerCallback((data) => {
            selectedDataSourceRow.current = data[SELECTED_ROW_INDEX_KEY];
        });
        return () => {
            unsubscriber?.();
        };
    }, [sdkRef]);

    useEffect(() => {
        const unsubscriber = sdkRef?.config?.events?.onAsyncError.registerCallback((exception) => {
            if (exception instanceof DataRowAsyncError) handleRowExceptions(exception);
        });
        return () => {
            unsubscriber?.();
        };
    }, [sdkRef, handleRowExceptions]);

    return {
        handleRowExceptions,
    };
};
