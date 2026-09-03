import { client } from "../../../Api/src/Internal/Discord/Client";
import { Events } from "./events";
export class Bot {
    private m_token:string = "";
    private m_client_id: string = "";
    private m_commands: Array<any> = [];
    private m_events: Map<string,Array<Function>> = new Map<string,Array<Function>>();
    constructor(token: string,client_id: string) {
        this.m_client_id = client_id;
        this.m_token = token;
    }
    public async Run(): Promise<void> {
        /*        client.once("ready",(application) => {
            console.log(application.user.displayName)
        })
        client.on("messageCreate",(message) => {
            if (message.content.startsWith("!")) {
                message.reply(`user said: ${message.content.replace("!","")}`)
            }
        }) */

        
    
        for (const [event_name,callbacks] of this.m_events) {
            const event = new Events(event_name);
            for (const callback of callbacks) {
                event.set(callback);
            }
        }

        await client.login(this.m_token);
    }

    public register_event(name: string,callback: Function): void {
        let callbacks = [];
        callbacks.push(callback)
        this.m_events.set(name,callbacks);
    }
}

let bot: Bot;

export function copy_bot(bot_1:Bot) {
    bot = bot_1;
}

export function get_bot() {
    return bot;
}