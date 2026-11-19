interface Callback {
    m_callback: (callback: any) => Promise<void>,
    m_once: boolean
}

class EventSystem {
    private events_m = new Map<string, Array<Callback>>();
    constructor() {
    }
    public listen(name: string, callback: (callback: any) => Promise<void>) {
        const e = this.events_m.get(name) ?? [];

        e.push({
            m_callback: callback,
            m_once: false
        });

        this.events_m.set(name, e);
    }
    public async trigger(name: string, args: any) {
        const callbacks = this.events_m.get(name);

        if (!callbacks) {
            console.log(`no callback found for event: ${name}`)
            return;
        }

        for (const c of callbacks) {
            await c.m_callback(args);
        }
    }
}

export const events: EventSystem = new EventSystem();