// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockSdkMethod = <T extends (...args: unknown[]) => any>(
    impl?: T,
): jest.MockedFunction<T> & {
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
} => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fn = jest.fn(impl) as any;

    fn.addEventListener = jest.fn(() => jest.fn()); // returns Unsubscriber
    fn.removeEventListener = jest.fn();

    return fn;
};
