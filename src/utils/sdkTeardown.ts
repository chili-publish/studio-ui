/** The part of an SDK instance needed to shut it down, across studio-sdk versions. */
type ShutdownableSdk = { destroy?: () => void; connection?: { destroy?: () => void } };

/**
 * Shuts an SDK instance down and removes the engine iframe it created.
 *
 * Every mounted Studio UI creates its own engine, and an engine that is not torn down keeps
 * its whole realm alive - the Dart heap plus the CanvasKit and QuickJS WASM memory, roughly
 * 190MB per instance. Removing the iframe is what lets the browser discard that realm.
 *
 * `SDK.destroy()` only exists from studio-sdk 1.46 onwards, so older versions fall back to
 * destroying the postMessage connection. Both are idempotent, so running them in turn is
 * safe either way.
 *
 * @param sdk The SDK instance to shut down.
 * @param editorContainerId Id of the element the engine iframe was appended to.
 */
export const teardownSdk = (sdk: unknown, editorContainerId: string) => {
    const instance = sdk as ShutdownableSdk | undefined;

    const shutdownSteps = [() => instance?.destroy?.(), () => instance?.connection?.destroy?.()];

    for (const shutdown of shutdownSteps) {
        try {
            shutdown();
        } catch (error) {
            // Teardown runs while a component is unmounting. Rethrowing here would skip the
            // iframe removal below and leak the engine, so the failure is reported instead.
            // penpal's own iframe-removal monitor may also have closed the connection first.
            // eslint-disable-next-line no-console
            console.warn('Studio SDK teardown step failed:', error);
        }
    }

    // Scoped to the editor container on purpose. Looking the iframe up document-wide would
    // pick the first iframe on the page, which in an embedded setup is somebody else's
    // frame rather than this engine.
    document
        .getElementById(editorContainerId)
        ?.querySelectorAll('iframe')
        .forEach((iframe) => iframe.remove());
};
