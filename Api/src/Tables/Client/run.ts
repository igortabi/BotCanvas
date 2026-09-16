import {Bot, copy_bot } from "../../../../Shared/Types/Bot/class";

export function Runner(token: string,client_id: string,guild_id: Array<string>, disable_global_commands: boolean): void {
    const bot = new Bot(token,client_id,guild_id,disable_global_commands);
    copy_bot(bot);
    bot.Run();
}