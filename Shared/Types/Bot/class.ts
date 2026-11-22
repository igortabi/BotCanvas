import { Interaction, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, TextChannel } from "discord.js";
import { Client, ClientOptions, GatewayIntentBits, Partials } from "discord.js"
import { CanvasInteraction } from "./Events/Interaction";
import { CanvasGuild } from "../Classes/guild";
import { CanvasMember } from "../Classes/member";
import { CanvasMessage } from "../Classes/message";
import { COMMANDS } from "../Arrays/commands";
import { CanvasCommand } from "../Classes/command";
import { events } from "../../../Api/src/Internal/EventSystem";
import { CanvasChannel } from "../Classes/channel";
import { ENGINE } from "../../Data/engine";
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
    private m_registration_queue: Promise<void> = Promise.resolve();
    private m_interaction_listener_active: boolean = false;
    constructor(token: string,client_id: string,guild_id: Array<string>,disable_global_commands: boolean) {
        this.m_client_id = client_id;
        this.m_token = token;
        this.m_guilds = guild_id;
        this.m_client = new Client(options);
        this.m_disable_global_commands = disable_global_commands;
    }
    public Run(): void {
        
        const login_start = performance.now();
        events.listen("refrash_commands", async () => {
            console.log(`ran refrash_commands event`);

            if (!this.m_client.isReady()) {
                return;
            }

            await this.refresh_commands();
        });

        this.m_client.login(this.m_token).then(async () => {
            const client = this.m_client;
            ENGINE.add_global("Channels", new Proxy({}, {
                get(target, key) {
                    if (typeof key !== "string") return undefined;
                    if (key === "then" || key === "toJSON") return undefined;

                    const cached = client.channels.cache.get(key);

                    if (cached) {
                        //@ts-ignore
                        return new CanvasChannel(cached);
                    }

                    return client.channels.fetch(key).then(channel => {
                        if (!channel?.isSendable() || !channel.isTextBased()) {
                            return undefined;
                        }

                        return new CanvasChannel(channel);
                    });
                }
            }));
            console.log(`login: ${performance.now() - login_start}ms`);
            const register_start = performance.now();
            this.execute_commands();
            await this.refresh_commands();
            console.log(`run: ${performance.now() - register_start}ms`);
        }).catch((error) => {
            console.error("Failed to log in:", error);
        });
    }

    private refresh_commands(): Promise<void> {
        this.m_registration_queue = this.m_registration_queue
            .then(() => this.register_commands())
            .catch((error) => {
                console.error("Failed to refresh commands:", error);
            });

        return this.m_registration_queue;
    }
    public get_client(): Client {
        return this.m_client;
    }

    public Destroy(): void {
        this.m_client.destroy();
    }

    private async register_commands(): Promise<void> {
        const rest = new REST().setToken(this.m_token);

        const development_body = COMMANDS
            .filter(command => command.get_development_only())
            .map(toDiscordBody);

        const global_body = COMMANDS
            .filter(command => !command.get_development_only())
            .map(toDiscordBody);

        try {
            const registrations: Promise<unknown>[] = [];

            for (const guild_id of this.m_guilds) {
                const route = Routes.applicationGuildCommands(
                    this.m_client_id,
                    guild_id
                );

                registrations.push(
                    rest.put(route, { body: development_body })
                );
            }
            const global_route = Routes.applicationCommands(this.m_client_id);

            registrations.push(
                rest.put(global_route, {
                    body: this.m_disable_global_commands ? [] : global_body
                })
            );

            await Promise.all(registrations);

            console.log(
                `Registered ${development_body.length} development commands in ${this.m_guilds.length} servers.`
            );

            if (this.m_disable_global_commands) {
                console.log(
                    `Cleared global commands (global commands are disabled).`
                );
            } else {
                console.log(
                    `Registered ${global_body.length} global commands.`
                );
            }
        } catch (err) {
            console.error("Failed to register commands:", err);
        }
    }

    private async execute_commands(): Promise<void> {
        if (this.m_interaction_listener_active) {
            return;
        }

        this.m_interaction_listener_active = true;

        this.m_client.on("interactionCreate", async (interaction: Interaction) => {
            if (!interaction.isChatInputCommand()) {
                return;
            }
            //console.log(interaction)
            const command = COMMANDS.find((c) => {
                return c.get_name() == interaction.commandName
            });
            if (!command) {
                console.error("command not found")
                await interaction.reply({
                    content: "This command doesnt exists",
                    ephemeral: true
                }).catch((error) => {
                    console.error("Failed to reply to unknown command:", error);
                });
                return;
            }
            try {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferReply();
                }

                let canvas_interaction = {} as CanvasInteraction
                const guild = new CanvasGuild(interaction.guild);
                //@ts-ignore
                const member = new CanvasMember(interaction.member);
                const message = new CanvasMessage(interaction);
                const channel = new CanvasChannel(interaction.channel);
                
                canvas_interaction.guild = guild;
                canvas_interaction.member = member;
                canvas_interaction.message = message;
                canvas_interaction.channel = channel;
                const callback = command.get_callback();
                await callback(canvas_interaction);
            } catch (err) {
                console.error(err);

                try {
                    if (interaction.deferred || interaction.replied) {
                        await interaction.editReply({ content: "Error executing command." });
                    } else {
                        await interaction.reply({ content: "Error executing command.", ephemeral: true });
                    }
                } catch (reply_error) {
                    console.error("Failed to report command error:", reply_error);
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