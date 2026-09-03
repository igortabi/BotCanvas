import {Bot, copy_bot } from "../../../../Shared/Types/Bot/class";

export async function Runner(token: string,client_id: string,guild_id: Array<string>): Promise<void> {
    const bot = new Bot(token,client_id,guild_id);
    copy_bot(bot);
    await bot.Run();
}