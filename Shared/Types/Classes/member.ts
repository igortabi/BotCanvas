import { BanOptions, GuildMember } from "discord.js";
export class CanvasMember {
    private readonly m_member: GuildMember;

    public constructor(member: GuildMember) {
        this.m_member = member;
    }

    public get_user_id(): string {
        return this.m_member.user.id;
    }

    public ban(reason: string | undefined, delete_message_from_last_sec: number | undefined): Promise<GuildMember> {
        let options = {} as BanOptions;
        options.reason = reason
        options.deleteMessageSeconds = delete_message_from_last_sec;
        return this.m_member.ban(options);
    }
}