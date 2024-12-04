export interface SDKError extends Error {
    cause: {
        name: string;
        message: string;
    };
}
