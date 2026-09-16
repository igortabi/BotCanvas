import { Command } from "../Interfaces/command";
import { CanvasOptions } from "../Interfaces/options";


class CanvasOption {
    private m_name: string = "";
    private m_description: string = "";
    private m_required: boolean = false;
    constructor(name: string,description: string,required: boolean) {
       this.m_name = name; 
       this.m_description = description;
       this.m_required = required; 
    }
}

export class CanvasCommand {
    private m_command: Command;
    private m_options: CanvasOptions[]
    constructor(command: Command) {
        this.m_command = command;
        this.m_options = [];
    }
    public get_name() {
        return this.m_command.name;
    }
    public get_description() {
        return this.m_command.description;
    }
    public get_callback() {
        return this.m_command.callback;
    }
    public get_development_only() {
        return this.m_command.development_only;
    }
    public add_option(name: string,description: string,required: boolean): CanvasOption {
        const option = new CanvasOption(name,description,required);
        let inter_option = {} as  CanvasOptions;
        inter_option.name = name;
        inter_option.description = description;
        inter_option.required = required;
        this.m_options.push(inter_option);
        return option;
    }
}