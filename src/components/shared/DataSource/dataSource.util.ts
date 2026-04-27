export const PAGE_SIZE = 50;

export const getPageItemById = async (connectorId: string, entryId: string) => {
    return await window.StudioUISDK.dataConnector.getPageItemById(connectorId ?? '', entryId, {
        limit: PAGE_SIZE,
    });
};

export const getPage = async (
    connectorId: string,
    pageConfig: { continuationToken?: string | null; previousPageToken?: string | null },
) => {
    return await window.StudioUISDK.dataConnector.getPage(connectorId ?? '', {
        limit: PAGE_SIZE,
        ...pageConfig,
    });
};
