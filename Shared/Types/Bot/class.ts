import { ChatInputCommandInteraction, GuildMember, Interaction, PermissionFlagsBits, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js";
import { Command, COMMANDS } from "./commands";
import { Client, ClientOptions, GatewayIntentBits, Partials } from "discord.js"
import { ENVIRONMENT } from "../../../environment/reader";
const options: ClientOptions = {
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildExpressions,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
        GatewayIntentBits.GuildMessagePolls,
        GatewayIntentBits.DirectMessagePolls
    ],

    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.GuildScheduledEvent,
        Partials.Message,
        Partials.Poll,
        Partials.PollAnswer,
        Partials.Reaction,
        Partials.SoundboardSound,
        Partials.ThreadMember,
        Partials.User
    ]
};

function toDiscordBody(command: Command): RESTPostAPIChatInputApplicationCommandsJSONBody {
    return {
        name: command.name,
        description: command.description
    };
}

export class Bot {
    private m_token:string = "";
    private m_client_id: string = "";
    private m_client = {} as Client;
    private m_guilds = [] as Array<string>;
    constructor(token: string,client_id: string,guild_id: Array<string>) {
        this.m_client_id = client_id;
        this.m_token = token;
        this.m_guilds = guild_id;
        this.m_client = new Client(options);
    }
    public async Run(): Promise<void> {
        await this.m_client.login(this.m_token);
        await this.register_commands();
        await this.execute_commands();
    }
    public get_client(): Client {
        return this.m_client;
    }
    private async register_commands(): Promise<void> {
        const rest = new REST().setToken(this.m_token);
        const body: RESTPostAPIChatInputApplicationCommandsJSONBody[] = COMMANDS.map(toDiscordBody);
        const GUILD_ID = ENVIRONMENT.GUILD_ID
        try {
            const route = GUILD_ID
                ? Routes.applicationGuildCommands(this.m_client_id, GUILD_ID)
                : Routes.applicationCommands(this.m_client_id);
            
            const result = await rest.put(route, { body }) as unknown[];
            console.log(`Registered ${result.length} commands.`);
        } catch (err) {
            console.error('Failed to register commands:', err);
        }
    }

    private async execute_commands(): Promise<void> {
        this.m_client.on("interactionCreate", async (interaction: Interaction) => {
            if (!interaction.isChatInputCommand()) {
                return;
            }
            const command = COMMANDS.find((c) => {
                return c.name == interaction.commandName
            });
            if (!command) {
                console.error("command not found")
                return;
            }
            try {
                await command.callback(interaction);
            } catch (err) {
                console.error(err);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: "Error executing command.", ephemeral: true });
                } else {
                    await interaction.reply({ content: "Error executing command.", ephemeral: true });
                }
            }
        });
    }

}

let bot: Bot;

export function copy_bot(bot_1:Bot) {
    bot = bot_1;
}

export function get_bot() {
    return bot;
}