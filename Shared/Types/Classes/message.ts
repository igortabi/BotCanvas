import {ChatInputCommandInteraction, GuildMember, Interaction, Message } from "discord.js";
import { CanvasMember } from "./member";

export class CanvasMessage {
    private readonly m_interaction: ChatInputCommandInteraction;

    public constructor(interaction: ChatInputCommandInteraction) {
        this.m_interaction = interaction;
    }
    public async reply(content: string): Promise<void> {
        try {
            if (this.m_interaction.deferred || this.m_interaction.replied) {
                await this.m_interaction.editReply(content);
            } else {
                await this.m_interaction.reply(content);
            }
        } catch (error) {
            console.error("Failed to reply to interaction:", error);
        }
    }
    public get_author(): CanvasMember | null {
        if (!this.m_interaction.member) {
            console.log(`Failed to get the member`)
            return null;
        }
        //@ts-ignore
        return new CanvasMember(this.m_interaction.member);
    }
}