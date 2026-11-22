import { LuaFactory, LuaLibraries } from 'wasmoon';
import { HandleTables } from './Internal/TableHandler';
import { Internal } from '../../Shared/Types/Handler';
import path from 'node:path';
import fs from "node:fs";
import { Events } from '../../Shared/Types/Bot/events';
import { Commands } from '../../Shared/Types/Bot/commands';
import { get_bot } from '../../Shared/Types/Bot/class';
import { clear_commands } from '../../Shared/Types/Arrays/commands';
import { events } from './Internal/EventSystem';
import { CanvasChannel } from '../../Shared/Types/Classes/channel';
import { ENGINE, load_engine_global } from '../../Shared/Data/engine';
const chokidar = require("chokidar");
let reload_queue: Promise<void> = Promise.resolve();

async function create_api() {
    await load_engine_global();
    const lua = ENGINE;
    if (!lua) {
        return;
    }
    let tables: Array<Internal> = [];
    await HandleTables(tables);
    lua.load_library(LuaLibraries.Base);
    lua.load_library(LuaLibraries.Package);
    lua.load_library(LuaLibraries.String);
    const built_tables = new Map<string, Record<string, Function>>();

    for (const table of tables) {
        const table_name = table.get_table();
        const built_table = built_tables.get(table_name) ?? {};

        Object.assign(built_table, table.build_table());
        built_tables.set(table_name, built_table);
    }

    for (const [table_name, built_table] of built_tables) {
        lua.add_global(table_name,built_table)
    }

    const cache = new Map<string, Events>();
    lua.add_global("Events", new Proxy({}, {
        get(target, key) {
            const event_name = String(key);

            if (!cache.has(event_name)) {
                cache.set(event_name, new Events(event_name));
            }

            return cache.get(event_name);
        }
    }));

    lua.add_global("Commands", new Proxy({}, {
        get(target, key) {
            return new Commands(String(key));
        }
    }));

    return lua;
}



async function run_tests() {
    events.clear();

    const previous_bot = get_bot();

    if (previous_bot) {
        previous_bot.Destroy();
    }

    clear_commands();
    const lua = await create_api();

    const test_folder = path.resolve(__dirname, "../tests");
    const tests = await fs.promises.readdir(test_folder);

    for (const test of tests) {
        if (!test.endsWith(".lua")) continue;

        const file_path = path.join(test_folder, test);
        const content = await fs.promises.readFile(file_path, "utf8");

        console.log(`\nRunning: ${test}`);

        try {
            if (!lua) {
                return;
            }
            await lua.run(content);
        } catch (error) {
            console.error(`Error in ${test}:`, error);
        }
    }
}

function schedule_reload(): Promise<void> {
    reload_queue = reload_queue
        .then(() => run_tests())
        .catch((error) => {
            console.error("Failed to reload:", error);
        });

    return reload_queue;
}

async function main() {
    const test_folder = path.resolve(__dirname, "../tests");

    chokidar.watch(test_folder, {
        ignoreInitial: true,
        awaitWriteFinish: true
    }).on("change", async (file: any) => {
        console.log(`\nFile changed: ${path.basename(file)}`);
        await schedule_reload();
    });

    await schedule_reload();
}

main();

