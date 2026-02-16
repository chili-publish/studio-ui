import { ReactNode, createContext, useContext, useMemo } from 'react';
import { Subscriber } from '../utils/subscriber';

interface ISubscriberContext {
    subscriber: Subscriber | null;
}

export const SubscriberContextDefaultValues: ISubscriberContext = {
    subscriber: null,
};

export const SubscriberContext = createContext<ISubscriberContext>(SubscriberContextDefaultValues);

export const useSubscriberContext = () => {
    return useContext(SubscriberContext);
};

export const SubscriberContextProvider = ({
    children,
    subscriber,
}: {
    children: ReactNode;
    subscriber: Subscriber;
}) => {
    const data = useMemo(
        () => ({
            subscriber,
        }),
        [subscriber],
    );

    return <SubscriberContext.Provider value={data}>{children}</SubscriberContext.Provider>;
};
