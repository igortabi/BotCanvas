
import { COMMANDS } from '../Arrays/commands';
import { CanvasCommand } from '../Classes/command';
import { Command } from '../Interfaces/command';
import { CanvasInteraction } from './Events/Interaction';






export class Commands {
    private m_command = {} as CanvasCommand;
    private m_name: string
    constructor(name: string) {
        this.m_name = name;
    }

    public register(description: string,callback: (interaction: CanvasInteraction) => Promise<void>,development_only: boolean): CanvasCommand {
        const base_command = {
            name: this.m_name,
            description: description,
            callback: callback,
            development_only: development_only
        }
        this.m_command = new CanvasCommand(base_command);
        COMMANDS.push(this.m_command);
        return this.m_command;
    }
}