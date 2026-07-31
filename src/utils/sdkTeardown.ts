/**
 * Shuts an SDK instance down and removes the engine iframe it created.
 *
 * Every mounted Studio UI creates its own engine, and an engine that is not torn down
 * keeps its whole realm alive - the Dart heap plus the CanvasKit and QuickJS WASM
 * memory, which is roughly 190MB per instance. Removing the iframe is what actually
 * lets the browser discard that realm.
 *
 * `SDK.destroy()` only exists from studio-sdk 1.46 onwards, so this falls back to
 * destroying the postMessage connection and removing the iframe by hand. Both paths are
 * idempotent, and neither is allowed to throw: teardown runs during React unmount, where
 * an exception would skip the rest of the cleanup.
 *
 * @param sdk The SDK instance to shut down.
 * @param editorContainerId Id of the element the engine iframe was appended to.
 */
export const teardownSdk = (sdk: unknown, editorContainerId: string) => {
    const instance = sdk as { destroy?: () => void; connection?: { destroy?: () => void } } | undefined;

    try {
        instance?.destroy?.();
    } catch {
        // An already destroyed instance must not block the rest of the teardown.
    }

    try {
        instance?.connection?.destroy?.();
    } catch {
        // penpal's own iframe-removal monitor may have destroyed it already.
    }

    // Scoped to the editor container on purpose. Looking the iframe up document-wide
    // would pick the first iframe on the page, which in an embedded setup is somebody
    // else's frame rather than this engine.
    document
        .getElementById(editorContainerId)
        ?.querySelectorAll('iframe')
        .forEach((iframe) => iframe.remove());
};
