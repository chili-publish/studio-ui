import { combineReducers, configureStore, Middleware } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { getEnvVariables } from '../utils/readEnvVariables';
import { errorHandlerMiddleware } from './middleware/errorHandler';

import document from './reducers/documentReducer';
import media from './reducers/mediaReducer';
import direction from './reducers/directionReducer';
import appConfig from './reducers/appConfigReducer';
import panel from './reducers/panelReducer';
import variable from './reducers/variableReducer';

const extraMiddlewares: Middleware[] = [errorHandlerMiddleware];

// Debug Logger to console
if (getEnvVariables().DEV && getEnvVariables().VITE_REDUX_LOGGER) {
    (async () => {
        const { createLogger } = await import('redux-logger');
        extraMiddlewares.unshift(
            createLogger({
                level: getEnvVariables().VITE_REDUX_LOGGER_LEVEL,
                collapsed: false,
            }),
        );
    })();
}

const rootReducer = combineReducers({
    document,
    media,
    direction,
    appConfig,
    panel,
    variable,
});

export type RootState = ReturnType<typeof rootReducer>;

export function setupStore(preloadedState?: Partial<RootState>) {
    return configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(extraMiddlewares),
        preloadedState,
    });
}

export type AppDispatch = ReturnType<typeof setupStore>['dispatch'];

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
