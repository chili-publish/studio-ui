import { useEffect, useRef } from 'react';

interface IContent {
    content: string | HTMLElement | DocumentFragment;
}
function HtmlRenderer(props: IContent) {
    const { content } = props;
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

    return <div ref={containerRef} />;
}

export default HtmlRenderer;
