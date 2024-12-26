interface EventEmmiterMap {
    [key: string]: (...args: any[]) => void
}

export default class EventEmmiter<M extends EventEmmiterMap> {
    private EventMap: { [key in keyof M]?: (M[key])[] } = {};
    private TempEventMap: { [key in keyof M]?: (M[key])[] } = {};
    constructor () {}

    on <T extends keyof M, K extends Object>(ev: T, handler: M[T], thisArg?: K) {
        if (!this.EventMap[ev]) this.EventMap[ev] = [];
        return (this.EventMap[ev]?.push(<M[T]>handler.bind(thisArg || window)) || 0) - 1;
    }

    once <T extends keyof M, K extends Object>(ev: T, handler: M[T], thisArg?: K) {
        if (!this.TempEventMap[ev]) this.TempEventMap[ev] = [];
        return (this.TempEventMap[ev]?.push(<M[T]>handler.bind(thisArg || window)) || 0) - 1;
    }
    
    // TODO: consider using a symbol here if possible.
    off <T extends keyof M>(ev: T, token: number) {
        this.EventMap[ev]?.splice(token, 1);
    }

    offce <T extends keyof M>(ev: T, token: number) {
        this.TempEventMap[ev]?.splice(token, 1);
    }

    emit <T extends keyof M>(ev: T, ...args: Parameters<M[T]>) {
        this.EventMap[ev]?.forEach(handler => handler(...args));
        this.TempEventMap[ev]?.forEach(handler => handler(...args));
        
        for (const key in this.TempEventMap) {
            this.TempEventMap[key]?.splice(0);
        }
    }
}

