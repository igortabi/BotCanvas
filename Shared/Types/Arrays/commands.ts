import { CanvasCommand } from "../Classes/command";
import { Command } from "../Interfaces/command";

export let COMMANDS: Array<CanvasCommand> = new Array();

export function clear_commands(): void {
    COMMANDS.length = 0;
}