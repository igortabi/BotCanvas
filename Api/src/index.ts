import { LuaFactory } from 'wasmoon';
import { HandleTables } from './Internal/TableHandler';
import { Internal } from '../../Shared/Types/Handler';
import { ENVIRONMENT } from '../../environment/reader';
import path from 'node:path';
import fs from "node:fs";
async function main() {
    const factory = new LuaFactory();
    const lua = await factory.createEngine();
    let tables:Array<Internal> = []
    await HandleTables(tables);
    for (const table of tables) {
        const m_table = table.get_table();
        const built_table = table.build_table();
        lua.global.set(m_table,built_table)
    }
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
    }        
    finally {
        //lua.global.close();
    }
}

main();