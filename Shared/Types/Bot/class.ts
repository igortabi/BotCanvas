import { Interaction, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js";
import { Client, ClientOptions, GatewayIntentBits, Partials } from "discord.js"
import { CanvasInteraction } from "./Events/Interaction";
import { CanvasGuild } from "../Classes/guild";
import { CanvasMember } from "../Classes/member";
import { CanvasMessage } from "../Classes/message";
import { COMMANDS } from "../Arrays/commands";
import { CanvasCommand } from "../Classes/command";
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

function toDiscordBody(command: CanvasCommand): RESTPostAPIChatInputApplicationCommandsJSONBody {
    return {
        name: command.get_name(),
        description: command.get_description()
    };
}

export class Bot {
    private m_token:string = "";
    private m_client_id: string = "";
    private m_client = {} as Client;
    private m_guilds = [] as Array<string>;
    private m_disable_global_commands: boolean = false;
    constructor(token: string,client_id: string,guild_id: Array<string>,disable_global_commands: boolean) {
        this.m_client_id = client_id;
        this.m_token = token;
        this.m_guilds = guild_id;
        this.m_client = new Client(options);
        this.m_disable_global_commands = disable_global_commands;
    }
    public Run(): void {
        const login_start = performance.now();

        this.m_client.login(this.m_token).then(() => {
            console.log(`login: ${performance.now() - login_start}ms`);

            const register_start = performance.now();

            this.register_commands();
            this.execute_commands();
            console.log(`run: ${performance.now() - register_start}ms`);
        });
    }
    public get_client(): Client {
        return this.m_client;
    }
    private register_commands(): void {
        const rest = new REST().setToken(this.m_token);

        const development_body = COMMANDS.filter(command => command.get_development_only()).map(toDiscordBody);
        try {
            for (const guild_id of this.m_guilds) {
                const route = Routes.applicationGuildCommands(
                    this.m_client_id,
                    guild_id
                );

                rest.put(route, {
                    body: development_body
                }).then(() => {
                    console.log(`Registered ${development_body.length} development commands in ${this.m_guilds.length}.`);
                });
            }
            if (!this.m_disable_global_commands) {
                const global_body = COMMANDS.filter(command => !command.get_development_only()).map(toDiscordBody);
                const route = Routes.applicationCommands(this.m_client_id);

                rest.put(route, {
                    body: global_body
                }).then(() => {
                    console.log(`Registered ${global_body.length} global commands.`);
                });
            }


            
        } catch (err) {
            console.error("Failed to register commands:", err);
        }

        
    }
    private async execute_commands(): Promise<void> {
        this.m_client.on("interactionCreate", async (interaction: Interaction) => {
            if (!interaction.isChatInputCommand()) {
                return;
            }
            const command = COMMANDS.find((c) => {
                return c.get_name() == interaction.commandName
            });
            if (!command) {
                console.error("command not found")
                return;
            }
            try {
                let canvas_interaction = {} as CanvasInteraction
                const guild = new CanvasGuild(interaction.guild);
                //@ts-ignore
                const member = new CanvasMember(interaction.member);
                const message = new CanvasMessage(interaction);
                canvas_interaction.guild = guild;
                canvas_interaction.member = member;
                canvas_interaction.message = message;
                const callback = command.get_callback();
                await callback(canvas_interaction);
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