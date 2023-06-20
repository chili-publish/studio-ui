/**
 * @name ItemCache
 * @description This class handles caching the promise.
 * We keep track of the combination [item, preview download promise] to allow future re-use.
 * It also prevents downloads for the same preview to happen twice whenever
 * the React components re-renders (for any reason)
 * @param  {T} target
 */
export class ItemCache<T> {
    instance: T;

    #preview?: Promise<Uint8Array>;

    constructor(target: T) {
        this.instance = target;
    }

    createOrGetDownloadPromise(call: () => Promise<Uint8Array>): Promise<Uint8Array> | undefined {
        if (this.#preview === undefined) this.#preview = ItemCache.internalCall(call);

        return this.#preview;
    }

    static async internalCall(call: () => Promise<Uint8Array>): Promise<Uint8Array> {
        const result = await call();

        if (result instanceof Uint8Array) return result;

        return new Uint8Array();
    }
}
