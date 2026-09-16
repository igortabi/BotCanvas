import { BanOptions, GuildMember, PermissionFlagsBits } from "discord.js";
export class CanvasMember {
    private readonly m_member: GuildMember;

    public constructor(member: GuildMember) {
        this.m_member = member;
    }

    public get_user_id(): string {
        return this.m_member.user.id;
    }

    public async ban(reason: string | undefined, delete_message_hours: number | undefined): Promise<CanvasMember> {
        let options = {} as BanOptions;
        options.reason = reason
        if (delete_message_hours !== undefined) {
            options.deleteMessageSeconds = delete_message_hours * 3600;
        }
        const banned_member: GuildMember = await this.m_member.ban(options);
        return new CanvasMember(banned_member)
    }
    public has_permissions(flag_name: string) {
        const flag = PermissionFlagsBits[flag_name as keyof typeof PermissionFlagsBits];
        if (flag === undefined) {
            throw new Error(`Unknown permission flag: ${flag_name}`);
        }

        return this.m_member.permissions.has(flag);
    }
}