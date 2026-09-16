import {ChatInputCommandInteraction, Interaction, Message } from "discord.js";

export class CanvasMessage {
    private readonly m_interaction: ChatInputCommandInteraction;

    public constructor(interaction: ChatInputCommandInteraction) {
        this.m_interaction = interaction;
    }
    public reply(content: string): void {

        this.m_interaction.reply(content);
    }
}