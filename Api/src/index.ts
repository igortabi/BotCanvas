import { LuaFactory } from 'wasmoon';
import { HandleTables } from './Internal/TableHandler';
import { Internal } from '../../Shared/Types/Handler';

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
        // later handle actual things.
        await lua.doString(`
            Client.run("test")
        `)
    } catch(error) {
        console.error(error)
    }        
    finally {
        lua.global.close();
    }
}

main();