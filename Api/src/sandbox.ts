import { LuaFactory, LuaEngine } from "wasmoon";

export interface SandboxOptions {
 
    timeoutMs?: number;
    
    memoryLimitBytes?: number;
  
    hookInterval?: number;
}

const DEFAULTS: Required<SandboxOptions> = {
    timeoutMs: 1000,
    memoryLimitBytes: 32 * 1024 * 1024,
    hookInterval: 10_000,
};


const BOOTSTRAP = `
local load_, sethook, clock, pcall_ = load, debug.sethook, os.clock, pcall
local real_rep = string.rep
local MAX_REP = 1024 * 1024
local deadline

local safe_os = { time = os.time, clock = os.clock, date = os.date, difftime = os.difftime }

for _, k in ipairs({
    "io", "debug", "package", "require", "dofile", "loadfile", "load",
    "loadstring", "collectgarbage", "module", "newproxy",
}) do _G[k] = nil end
_G.os = safe_os
string.dump = nil

string.rep = function(s, n, sep)
    if (#s + (sep and #sep or 0)) * n > MAX_REP then
        error("string.rep result too large", 2)
    end
    return real_rep(s, n, sep)
end

local function timed_out()
    return deadline ~= nil and clock() > deadline
end

local function hook()
    if timed_out() then error("script execution timed out", 2) end
end


local cur_interval = 10000
local co_create, co_resume = coroutine.create, coroutine.resume
local pack, unpack = table.pack, table.unpack

coroutine.create = function(f)
    local co = co_create(f)
    sethook(co, hook, "", cur_interval)
    return co
end
coroutine.resume = function(co, ...)
    local r = pack(co_resume(co, ...))
    if not r[1] and timed_out() then error(r[2], 0) end
    return unpack(r, 1, r.n)
end
coroutine.wrap = function(f)
    local co = coroutine.create(f)
    return function(...)
        local r = pack(co_resume(co, ...))
        if not r[1] then error(r[2], 0) end
        return unpack(r, 2, r.n)
    end
end

local xpcall_ = xpcall
pcall = function(f, ...)
    local r = pack(pcall_(f, ...))
    if not r[1] and timed_out() then error(r[2], 0) end
    return unpack(r, 1, r.n)
end
xpcall = function(f, handler, ...)
    local r = pack(xpcall_(f, handler, ...))
    if not r[1] and timed_out() then error(r[2], 0) end
    return unpack(r, 1, r.n)
end

__bc_run = function(code, timeout, interval)
    local fn, err = load_(code, "=script", "t", _G)
    if not fn then error(err, 0) end
    cur_interval = interval
    deadline = clock() + timeout
    sethook(hook, "", interval)
    local ok, res = pcall_(fn)
    sethook()
    deadline = nil
    if not ok then error(res, 0) end
    return res
end
`;

type RunFn = (code: string, timeout: number, interval: number) => unknown;

export class LuaSandbox {
    private constructor(
        public readonly engine: LuaEngine,
        private readonly runFn: RunFn,
        private readonly opts: Required<SandboxOptions>,
    ) {}

    static async create(options: SandboxOptions = {}): Promise<LuaSandbox> {
        const opts = { ...DEFAULTS, ...options };
        const factory = new LuaFactory();
        const engine = await factory.createEngine({
            openStandardLibs: true,
            traceAllocations: true, // required for setMemoryMax
        });
        engine.global.setMemoryMax(opts.memoryLimitBytes);

        await engine.doString(BOOTSTRAP);

        
        const runFn = engine.global.get("__bc_run") as RunFn;
        engine.global.set("__bc_run", undefined);

        return new LuaSandbox(engine, runFn, opts);
    }

    
    expose(name: string, value: unknown): void {
        this.engine.global.set(name, value);
    }

    run(code: string): unknown {
        return this.runFn(code, this.opts.timeoutMs / 1000, this.opts.hookInterval);
    }

    close(): void {
        this.engine.global.close();
    }
}
