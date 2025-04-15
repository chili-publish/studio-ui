import { FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const PanelTitle = styled.h2<{ margin?: string }>`
    font-size: ${FontSizes.header};
    font-weight: 500;
    ${(props) => props.margin && `margin: ${props.margin};`};
    color: ${({ theme }) => theme.panel.color};
`;
export const SectionHelpText = styled.p`
    margin: 0;
    padding: 0;
    font-size: ${FontSizes.small};
    color: ${({ theme }) => theme.label.color};
`;

export const SectionWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin: 1rem 0;
`;
