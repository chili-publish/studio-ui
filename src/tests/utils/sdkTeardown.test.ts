import { teardownSdk } from '../../utils/sdkTeardown';

describe('teardownSdk', () => {
    const EDITOR_ID = 'studio-ui-chili-editor';
    let container: HTMLElement;
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = EDITOR_ID;
        document.body.appendChild(container);
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
        container.remove();
        warnSpy.mockRestore();
    });

    it('destroys the sdk and removes the engine iframe', () => {
        container.appendChild(document.createElement('iframe'));
        const destroy = jest.fn();

        teardownSdk({ destroy }, EDITOR_ID);

        expect(destroy).toHaveBeenCalledTimes(1);
        expect(container.getElementsByTagName('iframe')).toHaveLength(0);
    });

    it('falls back to the connection when the sdk has no destroy', () => {
        const connectionDestroy = jest.fn();

        teardownSdk({ connection: { destroy: connectionDestroy } }, EDITOR_ID);

        expect(connectionDestroy).toHaveBeenCalledTimes(1);
    });

    it('only removes iframes inside the editor container', () => {
        const outsider = document.createElement('iframe');
        document.body.appendChild(outsider);
        container.appendChild(document.createElement('iframe'));

        teardownSdk({}, EDITOR_ID);

        expect(container.getElementsByTagName('iframe')).toHaveLength(0);
        expect(outsider.isConnected).toBe(true);
        outsider.remove();
    });

    it('still removes the iframe when shutting the sdk down throws', () => {
        container.appendChild(document.createElement('iframe'));

        teardownSdk(
            {
                destroy: () => {
                    throw new Error('already destroyed');
                },
            },
            EDITOR_ID,
        );

        // The engine would leak if a failing destroy aborted the rest of the teardown.
        expect(container.getElementsByTagName('iframe')).toHaveLength(0);
        expect(warnSpy).toHaveBeenCalled();
    });

    it('is a no-op for a missing sdk or container', () => {
        expect(() => teardownSdk(undefined, EDITOR_ID)).not.toThrow();
        expect(() => teardownSdk({}, 'does-not-exist')).not.toThrow();
    });
});
