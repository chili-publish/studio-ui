/* eslint-disable @typescript-eslint/no-explicit-any, react/no-array-index-key */
import { DataRowAsyncError, VariableType } from '@chili-publish/studio-sdk';
import { ToastVariant } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';
import { useNotificationManager } from './contexts/NotificantionManager/NotificationManagerContext';
import { DATA_SOURCE_TOAST_ID } from './contexts/NotificantionManager/Notification.styles';

export const DATA_SOURCE_NOTIFICATION_ID = 'data-source-validation-msg';
const variableNameInQuotesRegex = /"([^"]*)"/;
const varTypesWithNoValue = [VariableType.number, VariableType.boolean];

const MsgWrapper = styled.div`
    white-space: pre-wrap;
    padding: 1rem 0;
`;
const BoldText = styled.span`
    font-weight: bold;
`;

type DataRowExceptionDTO = DataRowAsyncError['exceptions'][0];

const parseDataRowException = async (dataRowException: DataRowExceptionDTO) => {
    const variableNameMatch = dataRowException.message.match(variableNameInQuotesRegex);
    const variableName = variableNameMatch ? variableNameMatch[1] : null;
    if (variableName) {
        try {
            const variableInfo = (await window.StudioUISDK.variable.getByName(variableName)).parsedData;
            if (!variableInfo) return null;
            if (dataRowException.code === 403104) {
                return (
                    <>
                        <BoldText>{variableInfo.label ?? variableInfo.name}</BoldText> is invalid. The value is cleared.
                    </>
                );
            }
            if (
                dataRowException.code === 403032 ||
                (dataRowException.code === 403105 && varTypesWithNoValue.includes(variableInfo.type))
            ) {
                return (
                    <>
                        <BoldText>{variableInfo.label ?? variableInfo.name}</BoldText> is invalid. A default value is
                        used.
                    </>
                );
            }
        } catch {
            return null;
        }
    }
    return null;
};

export const useDataRowExceptionHandler = () => {
    const { addNotification } = useNotificationManager();

    const handleRowExceptions = async (asyncError: DataRowAsyncError) => {
        const exceptionPromises = Promise.all(
            asyncError.exceptions.map(async (exception) => parseDataRowException(exception)),
        );
        const messages = (await exceptionPromises).filter((msg) => !!msg);
        if (messages.length) {
            addNotification({
                id: DATA_SOURCE_NOTIFICATION_ID,
                dataId: DATA_SOURCE_TOAST_ID,
                message: (
                    <MsgWrapper>
                        {messages.map((msg, index) => (
                            <div key={`msg-${index}`}>{msg}</div>
                        ))}
                    </MsgWrapper>
                ) as any,
                type: ToastVariant.NEGATIVE,
            });
        }
    };

    return {
        handleRowExceptions,
    };
};
