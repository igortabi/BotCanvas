import { Snowflake, TextBasedChannel } from "discord.js";

export class CanvasChannel {
    private channel: TextBasedChannel | null;

    constructor(channel: TextBasedChannel | null) {
        this.channel = channel;
        this.send = this.send.bind(this);
    }

    public async send(message: any): Promise<void> {
        if (!this.channel || !this.channel.isSendable()) {
            return;
        }
        await this.channel.send(message);
    }
}