import { LuaEngine, LuaLibraries } from "wasmoon";

export class Engine {
    private m_lua: LuaEngine;
    constructor(lua: LuaEngine) {
        this.m_lua = lua;
    }
    public load_library(lib: LuaLibraries) {
        this.m_lua.global.loadLibrary(lib);
    }
    public add_global(name: string,value: unknown) {
        this.m_lua.global.set(name,value)
    }
    public run(source: string) {
        return this.m_lua.doString(source);
    }
}