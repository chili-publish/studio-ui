import { ITheme } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const VariableContainer = styled.div`
    display: flex;
    flex-direction: column;
`;
export const VariableLabel = styled.span`
    color: red;
`;

export const BooleanVariableContainer = styled.div`
    min-height: 2.5rem;
    display: flex;
    align-items: center;
`;

export const HelpTextWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    width: 100%;
    white-space: pre-wrap;
    > div:nth-child(2) {
        margin-bottom: 0;
    }
`;

export const DatePickerWrapper = styled.div<{ styles: ITheme }>`
    .react-datepicker {
        box-shadow: none !important;
        border: none !important;
        background-color: ${({ styles }) => styles.tray.backgroundColor} !important;
        display: flex;
        justify-content: center;

        &__header {
            background-color: ${({ styles }) => styles.tray.backgroundColor} !important;
            padding-top: 0;
        }
        &__month {
            padding-bottom: 0.625rem !important;
            min-height: 17.25rem;
        }
    }
`;
