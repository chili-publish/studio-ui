import { BooleanVariable, ConfigType, ShortTextVariable } from '@chili-publish/studio-sdk';

// replace second generic with particular ConfigType events properties when you wanted to subscribe to the Editor events
type EditorEvents = Pick<ConfigType, never>;

type Events = EditorEvents & {
    onVariableValueChanged: (payload: {
        id: string;
        value: ShortTextVariable['value'] | BooleanVariable['value'];
    }) => void;
};

export class Subscriber {
    private subscriptions: Partial<Record<keyof Events, Array<NonNullable<Events[keyof Events]>>>> = {};

    on<K extends keyof Events>(event: K, handler: NonNullable<Events[K]>) {
        if (!this.subscriptions[event]) {
            this.subscriptions[event] = [];
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.subscriptions[event]!.push(handler);
    }

    off<K extends keyof Events>(event: K, handler: NonNullable<Events[K]>) {
        if (!this.subscriptions[event]) {
            this.subscriptions[event] = [];
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.subscriptions[event]!.splice(this.subscriptions[event]!.indexOf(handler), 1);
    }

    emit<K extends keyof Events>(event: K, ...args: Parameters<NonNullable<Events[K]>>) {
        this.subscriptions[event]?.forEach((callback) => {
            (callback as (...args: Array<unknown>) => unknown)(...args);
        });
    }
}
