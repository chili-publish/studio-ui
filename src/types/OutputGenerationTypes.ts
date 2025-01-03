export type DataConnectorConfiguration = {
    dataConnectorId: string;
    dataConnectorParameters: {
        context: Record<string, string | boolean> | null;
    };
};
