# Bot Canvas

**Bot Canvas** is a free and open-source platform for creating Discord bots using Lua.

The goal is to make Discord bot development accessible without requiring users to learn JavaScript or TypeScript, while still providing enough flexibility for more advanced projects.

Support Discord server: https://discord.gg/RYj9YncZyr

> **Status:** Early development / local proof of concept.
> The first Lua ↔ JavaScript layer exists to run and test bot scripts **on your own machine**. It is **not ready for any serious bot** and should not be used for production workloads. See [Why this is not ready for serious bots](#why-this-is-not-ready-for-serious-bots).

## Vision

Bot Canvas aims to provide a complete development environment for Discord bots:

* Lua scripting
* Simple Discord API
* Lua editor
* Simulator
* Debugging and logs
* AI-assisted development
* Visual scripting
* Bot deployment
* Self-hosting
* Open-source infrastructure

The long-term goal is to make creating a Discord bot feel more like building an application than configuring a collection of Discord API calls.

## The first layer: local hosting and testing

Bot Canvas is being built in layers. The **first layer is a local runtime and testing harness**, not the final platform.

This layer:

* Runs locally through `npm run Api`.
* Boots a Lua engine (Wasmoon) and injects the Bot Canvas Lua API (`Client`, `Events`, `Commands`, `Json`).
* Logs a Discord bot into **your** development guild(s) with a token from your script.
* Registers slash commands and dispatches interactions to Lua callbacks.
* Watches `Api/tests/` and reloads on every save: the current bot is destroyed, the Lua engine is recreated, and **all** `.lua` files in that folder are executed again.

Its purpose is to make the Lua API and the TypeScript ↔ Lua bridge easy to iterate on. It is a development tool for a handful of trusted developers, not a hosting service, multi-tenant runtime, or bot deployment platform.

### Why this is not ready for serious bots

At the current stage, Bot Canvas is a proof of concept. Concretely:

* **No sandboxing or resource limits.** The Lua engine can reach every bridged JavaScript object. A script is trusted code, and a bad script can crash or stall the runtime.
* **No secret management.** Credentials are passed directly to `Client.run(...)` in a Lua file. Keep `Api/tests/` out of version control and never commit real tokens.
* **Small and unstable API.** Message replies, a few member/guild helpers, and slash commands are exposed. Buttons, modals, selects, command options wired to Discord, permissions, and most of the Discord API are not available yet.
* **One bot, one process, one guild set per run.** There is no project isolation, persistence, or scheduling.
* **Development-oriented reloads.** Saving a file restarts the bot and re-runs every script; in-memory state is lost.
* **No production hardening.** No structured logging, no rate-limit/error strategy beyond discord.js defaults, no automated test suite or CI.
* **The API will change.** Names, signatures, and behavior are expected to change significantly.

If you need a reliable bot today, use discord.js (or another mature library) directly. Bot Canvas is for learning, experimenting, and shaping the Lua API.

## How it works

Bot Canvas uses Lua as the scripting language while the underlying runtime is written in TypeScript.

```text
Lua script (Api/tests/*.lua)
 ↓
Bot Canvas Lua API (Client, Events, Commands, Json)
 ↓
TypeScript bridge (Wasmoon + Shared/types)
 ↓
Discord.js
 ↓
Discord
```

The Discord.js implementation is an internal detail. Lua scripts interact with the Bot Canvas API rather than directly using Discord.js.

The Lua-facing API is discovered dynamically: every folder inside `Api/src/Tables/` becomes a Lua table, and every `.ts` file inside it becomes a function on that table (the file exports a `Runner` function). Adding `Api/src/Tables/Client/foo.ts` exposes `Client.foo(...)` to Lua without touching the bootstrap code.

## Quick start (local testing)

### Requirements

* Node.js 18 or newer
* npm

### Setup

```bash
git clone https://github.com/igortabi/BotCanvas.git
cd BotCanvas
npm install
npm run setup
```

Run the cross-platform setup script. It checks your Node.js and npm versions, verifies the repository layout, confirms `Api/tests` is gitignored, and copies the example script into the local test folder:

```bash
npm run setup
```

The same script works on Windows, macOS and Linux. You can also call it directly with `node scripts/setup.mjs`; pass `--force` to overwrite an existing `Api/tests/start.lua` (the previous file is kept as `start.lua.bak`).

Edit `Api/tests/start.lua` with your bot token, application (client) ID, and development server ID(s), then start the runtime:

```bash
npm run Api
```

`Api/tests/` is gitignored, so your token and experiments stay local. The example only registers commands in the listed development servers, so you can iterate without polluting global commands.

Make sure the bot is invited to your development server with the `applications.commands` scope, and that the **Message Content** intent is enabled if you want `Events.messageCreate` to receive message text.

## Lua API (current)

These examples match the code in `Api/src/Tables` and `Shared/Types` today. Expect changes.

### `Client.run`

```lua
Client.run(token, client_id, guild_ids, disable_global_commands)
```

| Argument | Type | Meaning |
| --- | --- | --- |
| `token` | string | Bot token |
| `client_id` | string | Application / client ID used for command registration |
| `guild_ids` | table of strings | Development servers where development-only commands are registered |
| `disable_global_commands` | boolean | When `true`, global commands are cleared during development |

Call `Client.run` **before** registering events or commands. Events and commands need the running client instance.

```lua
Client.run("your_token", "your_client_id", {
    -- Bot Canvas supports more than one development server.
    "your_development_server_id"
}, true)
```

### Events

`Events.<event_name>:set(callback)` registers a listener on the discord.js client. Event names map directly to discord.js events, and the callback receives the raw discord.js object.

```lua
Events.clientReady:set(function (app)
    print(string.format("%s is now ready", app.user.tag))
end)

Events.messageCreate:set(function (message)
    print(message.content)
end)
```

### Commands

`Commands.<name>:register(description, callback, development_only)` registers a slash command and returns a command object.

```lua
local ping = Commands.ping:register("Replies with pong", function (ctx)
    ctx.message:reply("Pong!")
end, true) -- true = development servers only
```

* `development_only = true` registers the command in the guilds passed to `Client.run`.
* `development_only = false` registers it globally.
* The callback receives an interaction context:

```lua
Commands.whoami:register("Shows your user ID", function (ctx)
    local member = ctx.member
    local guild = ctx.guild
    local message = ctx.message

    print(member:get_user_id())
    print(guild:get_id())
    message:reply("Hello!")
end, true)
```

Command objects support:

```lua
ping:set_description("Replies with pong (updated)") -- re-registers while the bot is ready
ping:set_callback(function (ctx)
    ctx.message:reply("Pong again!")
end)

Client.reload_commands() -- force a command refresh
```

> **Note:** `add_option(...)` exists on the TypeScript command object, but options are not yet sent to Discord. Command options are on the roadmap.

### Interaction context objects

| Object | Methods |
| --- | --- |
| `ctx.message` | `reply(content)`, `get_author()` |
| `ctx.member` | `get_user_id()`, `has_permissions(flag_name)`, `ban(reason, delete_message_hours)` |
| `ctx.guild` | `get_id()` |

```lua
Commands.ban_check:register("Checks ban permission", function (ctx)
    if not ctx.member:has_permissions("BanMembers") then
        ctx.message:reply("You do not have permission to ban members.")
        return
    end

    local author = ctx.message:get_author()
    print(author:get_user_id())
    ctx.message:reply("You have permission to ban members.")
end, true)
```

`has_permissions` accepts a discord.js `PermissionFlagsBits` name such as `BanMembers`, `ManageGuild`, or `Administrator`.

### `Json`

```lua
print(Json.stringify({ hello = "world" }))
```

`Json.stringify(table)` serializes a table, converts big integers to strings, and marks circular references.

### Reload behavior

While `npm run Api` is running:

1. Change any `.lua` file in `Api/tests/`.
2. The current bot is destroyed, commands and events are cleared, and the Lua engine is recreated.
3. Every `.lua` file in `Api/tests/` is executed again.

Errors in one file are logged and do not stop the remaining files from running.

## Project structure

```text
BotCanvas/
├── Api/
│   ├── src/
│   │   ├── index.ts            # Lua engine bootstrap, test runner, file watcher
│   │   ├── Internal/           # table discovery and internal event bus
│   │   └── Tables/             # Lua API: folder = Lua table, file = function
│   ├── tests/                  # your local .lua scripts (gitignored)
│   └── tests.example/          # example script to copy into tests/
├── Platform/                   # planned hosted platform (empty for now)
├── scripts/
│   └── setup.mjs               # cross-platform local setup
├── Shared/
│   └── Types/                  # Bot, Commands, Events, Member, Guild, Message bridge classes
├── environment/
│   ├── env.example             # TOKEN, CLIENT_ID
│   └── reader.ts               # dotenv loader
├── package.json
├── README.md
└── LICENSE
```

### `Api`

Contains the local runtime and the Bot Canvas API exposed to Lua scripts.

### `Platform`

Will contain the larger platform infrastructure, including project management, deployment and other backend functionality.

### `Shared`

Contains the TypeScript classes and types that bridge Lua calls to discord.js objects.

### `environment`

A small dotenv reader. It is not wired into `Client.run` yet, so credentials are currently passed in the Lua script. The intended direction is to load them from environment variables.

## Roadmap

### Runtime

* [x] Execute Lua from TypeScript
* [x] TypeScript ↔ Lua bridge
* [x] Dynamic API discovery from `Api/src/Tables`
* [x] Discord.js client login
* [x] Slash command registration (development guilds and global)
* [x] Interaction context (`member`, `guild`, `message`)
* [x] Lua event registration
* [x] File-watch reload for local testing
* [ ] Lua event system (friendly wrappers over raw discord.js events)
* [ ] Command options wired to Discord
* [ ] Buttons, selects, modals, and components
* [ ] Runtime error handling and structured logs
* [ ] Resource limits
* [ ] Lua sandboxing
* [ ] Multi-bot / project isolation

### Developer experience

* [ ] Lua editor
* [ ] LuaLS integration
* [ ] Autocomplete
* [ ] API documentation site
* [ ] Simulator
* [ ] Logs
* [ ] Debugger

### Platform

* [ ] Projects
* [ ] Authentication
* [ ] Bot deployment
* [ ] Project storage
* [ ] Web interface
* [ ] Self-hosting

### Advanced features

* [ ] AI assistant
* [ ] Visual scripting
* [ ] Blueprint-style editor
* [ ] Code generation
* [ ] Plugin/extensibility system

## Educational Project

Bot Canvas is primarily an **educational and experimental project**.

It is being developed as a way to learn and experiment with:

* TypeScript and Node.js
* Lua and Lua runtimes
* Discord API development
* Software architecture
* Backend and infrastructure design
* Sandboxing and runtime security
* Developer tooling
* Visual programming
* AI-assisted development

The long-term goal is to build a fully usable platform, but Bot Canvas should **not currently be treated as a production-ready or professional-grade project**.

The codebase, architecture, APIs, and design decisions are expected to change significantly throughout development. Some implementations may intentionally prioritize learning and experimentation over production-level solutions.

Use the project accordingly and do not rely on its current implementation for critical production workloads.

## Open source

Bot Canvas is released under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

The project is intended to remain free and open source, including for self-hosting.

See [`LICENSE`](LICENSE) for the full license.

## Contributing

The project is currently in early development and its architecture is still evolving.

Contributions, ideas and discussions are welcome, but expect APIs and internal systems to change while the foundation is being built.

## Credits

Bot Canvas uses the following open-source projects:

* **discord.js** — Discord API library for Node.js
* **Wasmoon** — Lua runtime for JavaScript/TypeScript

Full license and attribution information for third-party dependencies can be found in their respective packages and license files.

Bot Canvas is not affiliated with or endorsed by the authors or maintainers of these projects.

## Disclaimer

Bot Canvas is an independent project and is not affiliated with or endorsed by Discord Inc.

---

**Bot Canvas — Build Discord bots with Lua.**
