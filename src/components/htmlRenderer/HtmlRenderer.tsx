import { useEffect, useRef } from 'react';
import { Container } from './HtmlRenderer.style';

interface IContent {
    content: string | HTMLElement | DocumentFragment;
    isVisible?: boolean;
}
function HtmlRenderer(props: IContent) {
    const { content, isVisible } = props;
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;

        if (container) {
            // Clear any previous content
            container.innerHTML = '';

            if (typeof content === 'string') {
                // Handle serialized HTML content
                container.innerHTML = content;
            } else if (content instanceof HTMLElement || content instanceof DocumentFragment) {
                // Handle non-serialized HTML content
                container.appendChild(content);
            }
        }
    }, [content]);

    return <Container ref={containerRef} isVisible={isVisible} />;
}

export default HtmlRenderer;
