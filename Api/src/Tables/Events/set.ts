import { get_bot } from "../../../../Shared/Types/Bot/class";
export function Runner(callback: Function) {
    const bot = get_bot();
    bot.register_event(__filename,callback)
}