import { LuaFactory, LuaLibraries } from 'wasmoon';
import { HandleTables } from './Internal/TableHandler';
import { Internal } from '../../Shared/Types/Handler';
import path from 'node:path';
import fs from "node:fs";
import { Events } from '../../Shared/Types/Bot/events';
import { Commands } from '../../Shared/Types/Bot/commands';
import { GuildMember, PermissionFlagsBits } from 'discord.js';
async function main() {
    const factory = new LuaFactory();
    const lua = await factory.createEngine();
    let tables:Array<Internal> = []
    await HandleTables(tables);
    lua.global.loadLibrary(LuaLibraries.Base)
    
    for (const table of tables) {
        const m_table = table.get_table();
        const built_table = table.build_table();
        lua.global.set(m_table,built_table)
    }
    const cache = new Map<string, Events>();
    lua.global.set("Events", new Proxy({}, {
        get(target, key) {
            const event_name = String(key);
            if (!cache.has(event_name)) {
                cache.set(event_name, new Events(event_name));
            };
            return cache.get(event_name);
        }
    }));

    lua.global.set("Commands",new Proxy({},{
        get(t,k) {
            const command_name = String(k);
            return new Commands(command_name);
        }
    }))
    lua.global.set("hasPermission", (member: GuildMember, flagName: string) => {
        const flag = PermissionFlagsBits[flagName as keyof typeof PermissionFlagsBits];
        if (flag === undefined) {
            throw new Error(`Unknown permission flag: ${flagName}`);
        }
        return member.permissions.has(flag); // BigInt math stays in JS
    });
    try {
        const test_folder = path.resolve(path.resolve(__dirname,"../"), "tests");
        const tests = await fs.promises.readdir(test_folder);
        for (const test of tests) {
            const test_content = await fs.promises.readFile(
                path.join(test_folder, test),
                "utf8"
            );
            await lua.doString(test_content)
        }
    } catch(error) {
        console.error(error)
        lua.global.close();
    }        
    finally {
        //lua.global.close();
    }
}

main();