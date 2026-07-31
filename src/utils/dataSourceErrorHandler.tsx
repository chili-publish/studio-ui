import { Variable, VariableType } from '@chili-publish/studio-sdk';
import styled from 'styled-components';

const BoldText = styled.span`
    font-weight: bold;
`;

type ErrorContext = {
    errorCode: number;
    columnName?: string;
};
const varTypesWithNoValue = [VariableType.number, VariableType.boolean];

export const dataSourceErrorHandler = (errorContext: ErrorContext, variableData: Variable | null) => {
    const { errorCode, columnName } = errorContext;
    const errCode = errorCode.toString();

    if (errCode === '403104' || (errCode === '403062' && variableData?.type === VariableType.image)) {
        return (
            <>
                <BoldText>{variableData?.label ?? variableData?.name}</BoldText> is invalid. The value is cleared.
            </>
        );
    }
    if (
        errCode === '403032' ||
        (errCode === '403105' && variableData?.type && varTypesWithNoValue.includes(variableData.type))
    ) {
        if (variableData?.type === VariableType.dataSource && !!columnName) {
            return (
                <>
                    <BoldText>{variableData?.label ?? variableData?.name}</BoldText> is invalid. Missing data field{' '}
                    {`'${columnName}'`}. A default value is used.
                </>
            );
        } else {
            return (
                <>
                    <BoldText>{variableData?.label ?? variableData?.name}</BoldText> is invalid. A default value is
                    used.
                </>
            );
        }
    }
    return null;
};
