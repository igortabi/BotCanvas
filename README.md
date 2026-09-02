# Bot Canvas

**Bot Canvas** is a free and open-source platform for creating Discord bots using Lua.

The goal is to make Discord bot development accessible without requiring users to learn JavaScript or TypeScript, while still providing enough flexibility for more advanced projects.

> **Status:** Early development / proof of concept

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

## How it works

Bot Canvas uses Lua as the scripting language while the underlying runtime is written in TypeScript.

```text
Lua
 ↓
Bot Canvas Lua API
 ↓
TypeScript runtime
 ↓
Discord.js
 ↓
Discord
```

The Discord.js implementation is an internal detail. Lua scripts interact with the Bot Canvas API rather than directly using Discord.js.

## Current state

The project is currently focused on building the core runtime.

Current proof of concept functionality includes:

* TypeScript runtime
* Lua execution using Wasmoon
* TypeScript ↔ Lua communication
* Dynamic API loading
* Environment configuration
* Discord.js integration
* Discord bot login
* Discord event handling
* Basic Discord message handling

Example of the current Discord integration:

```ts
client.on("messageCreate", (message) => {
    if (message.content.startsWith("!")) {
        message.reply(
            `user said: ${message.content.replace("!", "")}`
        );
    }
});
```

The API will eventually expose this functionality to Lua instead of requiring users to interact with Discord.js directly.

## Planned API

The API is still being designed, but the intended direction is something similar to:

```lua
Client.run(token, client_id)

events.messageCreate:set(function(message)
    message:reply("Hello!")
end)
```

The exact API is expected to change significantly during development.

## Project structure

The current project is intentionally small:

```text
Bot-Canvas/
├── Api/
│   └── src/
│       └── ...
├── Platform/
│   └── ...
├── LICENSE
├── README.md
└── .gitignore
```

### `Api`

Contains the Bot Canvas API exposed to Lua scripts.

### `Platform`

Will contain the larger platform infrastructure, including the runtime, project management, deployment and other backend functionality.

## Development

### Requirements

* Node.js
* npm
* TypeScript

### Setup

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd bot-canvas
npm install
```

The project is currently under active development, so setup instructions and project structure may change.

## Roadmap

### Runtime

* [x] Execute Lua from TypeScript
* [x] TypeScript → Lua functions
* [x] Dynamic API discovery
* [x] Discord.js integration
* [x] Basic Discord bot
* [ ] Lua event system
* [ ] Discord API abstraction
* [ ] Runtime error handling
* [ ] Resource limits
* [ ] Lua sandboxing

### Developer experience

* [ ] Lua editor
* [ ] LuaLS integration
* [ ] Autocomplete
* [ ] API documentation
* [ ] Simulator
* [ ] Logs
* [ ] Debugger

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
