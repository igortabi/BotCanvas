import { ChatInputCommandInteraction } from 'discord.js';

export interface Command {
    name: string,
    description: string,
    callback: (interaction: ChatInputCommandInteraction) => Promise<void>,
}
export let COMMANDS: Array<Command> = new Array();
export class Commands {
    private m_command = {} as Command;
    private m_name: string
    constructor(name: string) {
        this.m_name = name;
    }

    public register(description: string,callback: (interaction: ChatInputCommandInteraction) => Promise<void>) {
        this.m_command = {
            name: this.m_name,
            description: description,
            callback: callback,
        }
        COMMANDS.push(this.m_command);
        
    }
}