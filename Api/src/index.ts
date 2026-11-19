import { LuaFactory, LuaLibraries } from 'wasmoon';
import { HandleTables } from './Internal/TableHandler';
import { Internal } from '../../Shared/Types/Handler';
import path from 'node:path';
import fs from "node:fs";
import { Events } from '../../Shared/Types/Bot/events';
import { Commands } from '../../Shared/Types/Bot/commands';
const chokidar = require("chokidar");
let lua: unknown;

async function create_api() {
    const factory = new LuaFactory();
    const lua = await factory.createEngine();

    let tables: Array<Internal> = [];
    await HandleTables(tables);

    lua.global.loadLibrary(LuaLibraries.Base);
    lua.global.loadLibrary(LuaLibraries.Package);
    lua.global.loadLibrary(LuaLibraries.String);

    const built_tables = new Map<string, Record<string, Function>>();

    for (const table of tables) {
        const table_name = table.get_table();
        const built_table = built_tables.get(table_name) ?? {};

        Object.assign(built_table, table.build_table());
        built_tables.set(table_name, built_table);
    }

    for (const [table_name, built_table] of built_tables) {
        lua.global.set(table_name, built_table);
    }

    const cache = new Map<string, Events>();

    lua.global.set("Events", new Proxy({}, {
        get(target, key) {
            const event_name = String(key);

            if (!cache.has(event_name)) {
                cache.set(event_name, new Events(event_name));
            }

            return cache.get(event_name);
        }
    }));

    lua.global.set("Commands", new Proxy({}, {
        get(target, key) {
            return new Commands(String(key));
        }
    }));

    return lua;
}



async function run_tests() {
    if (lua) {
        //@ts-ignore
        lua.global.close();
    }

    lua = await create_api();

    const test_folder = path.resolve(__dirname, "../tests");
    const tests = await fs.promises.readdir(test_folder);

    for (const test of tests) {
        if (!test.endsWith(".lua")) continue;

        const file_path = path.join(test_folder, test);
        const content = await fs.promises.readFile(file_path, "utf8");

        console.log(`\nRunning: ${test}`);

        try {
            //@ts-ignore
            await lua.doString(content);
        } catch (error) {
            console.error(`Error in ${test}:`, error);
        }
    }
}

async function main() {
    const test_folder = path.resolve(__dirname, "../tests");

    chokidar.watch(test_folder, {
        ignoreInitial: true,
        awaitWriteFinish: true
    }).on("change", async (file: any) => {
        console.log(`\nFile changed: ${path.basename(file)}`);
        await run_tests();
    });

    await run_tests();
}

main();

