import { client } from "../../Internal/Discord/Client";

export async function Runner(event_name: string,callback:Function): Promise<void> {
    await client.on(event_name,(args) => {
        callback(args);
    })
}