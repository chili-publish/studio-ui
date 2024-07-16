import { ReactNode, createContext, useContext, useMemo } from 'react';
import { Subscriber } from '../utils/subscriber';

interface SubscriberContext {
    subscriber: Subscriber | null;
}

export const SubscriberContextDefaultValues: SubscriberContext = {
    subscriber: null,
};

export const SubscriberContext = createContext<SubscriberContext>(SubscriberContextDefaultValues);

export const useSubscriberContext = () => {
    return useContext(SubscriberContext);
};

export function SubscriberContextProvider({ children, subscriber }: { children: ReactNode; subscriber: Subscriber }) {
    const data = useMemo(
        () => ({
            subscriber,
        }),
        [subscriber],
    );

    return <SubscriberContext.Provider value={data}>{children}</SubscriberContext.Provider>;
}
