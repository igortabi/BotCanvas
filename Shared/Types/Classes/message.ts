import {ChatInputCommandInteraction, GuildMember, Interaction, Message } from "discord.js";
import { CanvasMember } from "./member";

export class CanvasMessage {
    private readonly m_interaction: ChatInputCommandInteraction;

    public constructor(interaction: ChatInputCommandInteraction) {
        this.m_interaction = interaction;
    }
    public reply(content: string): void {

        this.m_interaction.reply(content);
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