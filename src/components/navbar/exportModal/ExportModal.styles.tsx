import { Colors, FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const DragHandleContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3rem;
    z-index: 1;
`;

export const IconWrapper = styled.div`
    z-index: 2;
    padding: 0.75rem;
    svg {
        padding: 0;
    }
    cursor: pointer;
`;

export const MenuContainer = styled.div`
    background-color: var(--sw-base-background);
    border-radius: 4px;
    box-shadow: 0 1px 4px 0 rgba(31, 31, 31, 0.5);
`;

export const TitleContainer = styled.div`
    color: ${Colors.PRIMARY_WHITE};
    font-size: 1.0625rem;
    font-weight: 500;
`;
export const Title = styled.div`
    font-size: ${FontSizes.studioHeader};
    font-weight: 500;
    color: ${Colors.PRIMARY_WHITE};
`;

export const Container = styled.div`
    padding: 0.4375rem 1.25rem 1.25rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

export const Label = styled.span`
    font-size: ${FontSizes.label};
    color: ${Colors.DARK_GRAY_500};
    padding-top: 1rem;
`;
export const OptionText = styled.div`
    display: flex;
    flex-direction: column;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    > * {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
`;

export const OptionWithIcon = styled.span<{ height?: string }>`
    display: flex;
    gap: 0.5rem;
    align-items: center;
    min-width: 0;
    height: ${(props) => props.height ?? 'auto'};
    svg {
        min-width: 1rem;
    }
`;
