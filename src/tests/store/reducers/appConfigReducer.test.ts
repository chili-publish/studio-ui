import { configureStore } from '@reduxjs/toolkit';
import appConfig, { selectFirstPartyIntegration } from 'src/store/reducers/appConfigReducer';
import type { RootState } from 'src/store';

function getStore(firstPartyIntegration?: boolean) {
    return configureStore({
        reducer: { appConfig },
        preloadedState: {
            appConfig: { firstPartyIntegration },
        },
    });
}

describe("'appConfig' reducer", () => {
    describe('selectFirstPartyIntegration', () => {
        it('returns true when firstPartyIntegration is enabled', () => {
            const store = getStore(true);

            expect(selectFirstPartyIntegration(store.getState() as RootState)).toBe(true);
        });

        it('returns false when firstPartyIntegration is disabled', () => {
            const store = getStore(false);

            expect(selectFirstPartyIntegration(store.getState() as RootState)).toBe(false);
        });

        it('returns undefined when firstPartyIntegration is not provided', () => {
            const store = getStore();

            expect(selectFirstPartyIntegration(store.getState() as RootState)).toBeUndefined();
        });
    });
});
