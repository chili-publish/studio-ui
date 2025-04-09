import { isRejected, Middleware } from '@reduxjs/toolkit';

export const errorHandlerMiddleware: Middleware = () => (next) => (action) => {
    if (isRejected(action)) {
        // eslint-disable-next-line no-console
        console.error(`Error: [${action.type}]`, action.error.message, action.error);
        // TOOD: Later one we might dispatch an action with error to have single place of error handling
    }
    return next(action);
};
