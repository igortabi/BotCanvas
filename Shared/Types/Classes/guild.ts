import { Guild } from "discord.js";

export class CanvasGuild {
    private readonly m_guild: Guild | null;

    public constructor(guild: Guild | null) {
        this.m_guild = guild;
    }
}