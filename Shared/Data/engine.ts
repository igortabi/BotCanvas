import { LuaFactory } from "wasmoon";
import { Engine } from "../../framework/engine/class";

export let ENGINE: Engine;


export async function load_engine_global() {
    const factory = new LuaFactory();
    const lua = await factory.createEngine();
    ENGINE = new Engine(lua);
}
