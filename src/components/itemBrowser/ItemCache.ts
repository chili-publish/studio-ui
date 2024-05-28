/**
 * @name ItemCache
 * @description This class handles caching the promise.
 * We keep track of the combination [item, preview download promise] to allow future re-use.
 * It also prevents downloads for the same preview to happen twice whenever
 * the React components re-renders (for any reason)
 * @param  {T} target
 */

export type PreviewResponse = {
    status: 200;
    data: Promise<Uint8Array>;
};

export class ItemCache<T> {
    instance: T;

    #preview?: Promise<PreviewResponse>;

    constructor(target: T) {
        this.instance = target;
    }

    createOrGetDownloadPromise(call: () => Promise<Uint8Array>): Promise<PreviewResponse> {
        if (this.#preview === undefined) this.#preview = ItemCache.internalCall(call);

        return this.#preview;
    }

    static async internalCall(call: () => Promise<Uint8Array>): Promise<PreviewResponse> {
        const result = await call();

        if (result instanceof Uint8Array) return { status: 200, data: Promise.resolve(result) };

        return { status: 200, data: Promise.resolve(new Uint8Array()) };
    }
}
