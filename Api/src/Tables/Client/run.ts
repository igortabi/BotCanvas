import {Bot } from "../../../../Shared/Types/Bot/class";

export async function Runner(token: string,client_id: string): Promise<void> {
    const bot = new Bot(token,client_id);
    await bot.Run();
}