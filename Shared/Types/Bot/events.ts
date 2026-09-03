import { get_bot } from "./class";

export class Events {
    private m_name: string;

    constructor(name: string) {
        this.m_name = name;
    }

    

    public set(callback: Function): void {
        const bot = get_bot();
        const client = bot.get_client();
        client.on(this.m_name, (args) => {
            callback(args);
        });
    }
}