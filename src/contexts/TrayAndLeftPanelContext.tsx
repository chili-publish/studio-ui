import { ReactNode, createContext, useContext, useMemo, useState } from 'react';
import { ContentType, ITrayAndLeftPanelContext } from './TrayAndLeftPanelContext.types';

const TrayAndLeftPanelContextDefaultValues: ITrayAndLeftPanelContext = {
    showVariablesPanel: () => undefined,
    showImagePanel: () => undefined,
    contentType: ContentType.VARIABLES_LIST,
    currentVariableId: '',
};

export const TrayAndLeftPanelContext = createContext<ITrayAndLeftPanelContext>(TrayAndLeftPanelContextDefaultValues);

export const useTrayAndLeftPanelContext = () => {
    return useContext(TrayAndLeftPanelContext);
};

export function TrayAndLeftPanelContextProvider({ children }: { children: ReactNode }) {
    const [contentType, setContentType] = useState<ContentType>(ContentType.VARIABLES_LIST);
    const [currentVariableId, setCurrentVariableId] = useState<string>('');

    const data = useMemo(
        () => ({
            showVariablesPanel: () => setContentType(ContentType.VARIABLES_LIST),
            showImagePanel: (variableId: string) => {
                setCurrentVariableId(variableId);
                setContentType(ContentType.IMAGE_PANEL);
            },
            contentType,
            currentVariableId,
        }),
        [currentVariableId, contentType],
    );

    return <TrayAndLeftPanelContext.Provider value={data}>{children}</TrayAndLeftPanelContext.Provider>;
}
