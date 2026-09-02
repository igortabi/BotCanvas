import { client } from "../../../Api/src/Internal/Discord/Client";

export class Bot {
    private m_token:string = "";
    private m_client_id: string = "";
    private m_commands: Array<any> = [];
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
        await client.login(this.m_token);
    }
}
