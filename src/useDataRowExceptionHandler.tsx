/* eslint-disable @typescript-eslint/no-explicit-any, react/no-array-index-key */
import { DataRowAsyncError, VariableType } from '@chili-publish/studio-sdk';
import { ToastVariant } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';
import { useNotificationManager } from './contexts/NotificantionManager/NotificationManagerContext';
import { DATA_SOURCE_TOAST_ID } from './contexts/NotificantionManager/Notification.styles';

export const DATA_SOURCE_NOTIFICATION_ID = 'data-source-validation-msg';
const variableNameInQuotesRegex = /"([^"]*)"/;
const varTypesWithNoValue = [VariableType.number, VariableType.boolean];

const BoldText = styled.span`
    font-weight: bold;
`;

export const useDataRowExceptionHandler = () => {
    const { addNotification } = useNotificationManager();

    const handleRowExceptions = async (asyncError: DataRowAsyncError, selectedDataSourceRow?: number) => {
        const exceptionPromises = Promise.all(
            asyncError.exceptions.map(async (dataRowException) => {
                const variableNameMatch = dataRowException.message.match(variableNameInQuotesRegex);
                const variableName = variableNameMatch ? variableNameMatch[1] : null;
                if (variableName) {
                    try {
                        const variableInfo = (await window.StudioUISDK.variable.getByName(variableName)).parsedData;
                        return { ...dataRowException, variableInfo };
                    } catch {
                        return null;
                    }
                }
                return null;
            }),
        );
        const errMsgsWithVariableInfo = await exceptionPromises;

        errMsgsWithVariableInfo
            .filter((item) => !!item)
            .forEach((exception) => {
                let msg;
                if (exception.code === 403104) {
                    msg = (
                        <>
                            <BoldText>{exception?.variableInfo?.label ?? exception?.variableInfo?.name}</BoldText> is
                            invalid. The value is cleared.
                        </>
                    );
                }
                if (
                    exception.code === 403032 ||
                    (exception.code === 403105 &&
                        exception?.variableInfo &&
                        varTypesWithNoValue.includes(exception?.variableInfo?.type))
                ) {
                    msg = (
                        <>
                            <BoldText>{exception?.variableInfo?.label ?? exception?.variableInfo?.name}</BoldText> is
                            invalid. A default value is used.
                        </>
                    );
                }
                addNotification({
                    id: `${DATA_SOURCE_TOAST_ID}-${selectedDataSourceRow}-${exception?.variableInfo?.id}`,
                    message: msg as any,
                    type: ToastVariant.NEGATIVE,
                });
            });
    };

    return {
        handleRowExceptions,
    };
};
