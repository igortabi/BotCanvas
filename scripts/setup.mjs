#!/usr/bin/env node
/**
 * Bot Canvas local setup.
 *
 * Cross-platform: Windows, macOS and Linux.
 *
 *   npm run setup
 *   node scripts/setup.mjs
 *   node scripts/setup.mjs --force   # overwrite an existing Api/tests/start.lua
 *
 * Checks the Node.js/npm requirements, verifies the repository layout, and
 * copies Api/tests.example/start.lua to Api/tests/start.lua so the local
 * runtime has something to run.
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const min_node_major = 18;
const force = process.argv.includes("--force");

const problems = [];
const warnings = [];

function ok(label) {
    console.log(`  [ok]   ${label}`);
}

function warn(label) {
    console.log(`  [warn] ${label}`);
    warnings.push(label);
}

function fail(label) {
    console.log(`  [fail] ${label}`);
    problems.push(label);
}

function platform_name() {
    switch (process.platform) {
        case "win32": return "Windows";
        case "darwin": return "macOS";
        case "linux": return "Linux";
        default: return process.platform;
    }
}

function check_node() {
    const version = process.versions.node;
    const major = Number(version.split(".")[0]);

    if (major >= min_node_major) {
        ok(`Node.js ${version}`);
    } else {
        fail(
            `Node.js ${version} is too old. ` +
            `Bot Canvas needs Node.js ${min_node_major} or newer.`
        );
    }
}

function check_npm() {
    const result = process.platform === "win32"
        ? spawnSync("npm --version", { encoding: "utf8", shell: true })
        : spawnSync("npm", ["--version"], { encoding: "utf8" });

    if (result.status === 0) {
        ok(`npm ${result.stdout.trim()}`);
    } else {
        fail("npm was not found. Install Node.js (which includes npm) and run setup again.");
    }
}

function check_file(relative_path) {
    const absolute_path = path.join(root, relative_path);
    const label = relative_path.split(path.sep).join("/");

    if (fs.existsSync(absolute_path)) {
        ok(label);
        return true;
    }

    fail(`${label} is missing. Run setup from the Bot Canvas repository.`);
    return false;
}

function check_dependencies() {
    if (fs.existsSync(path.join(root, "node_modules"))) {
        ok("Dependencies installed (node_modules exists)");
    } else {
        warn("Dependencies are not installed yet. Run: npm install");
    }
}

function check_gitignore() {
    const gitignore_path = path.join(root, ".gitignore");

    if (!fs.existsSync(gitignore_path)) {
        warn("No .gitignore found. Api/tests must never be committed.");
        return;
    }

    const ignored = fs.readFileSync(gitignore_path, "utf8")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .some((line) => line === "/Api/tests" || line === "Api/tests");

    if (ignored) {
        ok("Api/tests is gitignored");
    } else {
        warn("Api/tests is not gitignored. Add it so bot tokens are never committed.");
    }
}

function copy_example() {
    const example_path = path.join(root, "Api", "tests.example", "start.lua");
    const tests_path = path.join(root, "Api", "tests");
    const target_path = path.join(tests_path, "start.lua");

    fs.mkdirSync(tests_path, { recursive: true });

    const existed = fs.existsSync(target_path);

    if (existed && !force) {
        ok("Api/tests/start.lua already exists (kept it; use --force to overwrite)");
        return;
    }

    if (existed) {
        fs.copyFileSync(target_path, `${target_path}.bak`);
        ok("Backed up the existing script to Api/tests/start.lua.bak");
    }

    fs.copyFileSync(example_path, target_path);

    if (existed) {
        ok("Overwrote Api/tests/start.lua");
    } else {
        ok("Created Api/tests/start.lua from tests.example");
    }
}

console.log("");
console.log(`Bot Canvas setup (${platform_name()} / ${process.arch})`);
console.log("");

check_node();
check_npm();
check_file("package.json");
check_file(path.join("Api", "tests.example", "start.lua"));
check_dependencies();
check_gitignore();

if (problems.length === 0) {
    copy_example();
}

console.log("");

if (problems.length > 0) {
    console.log("Setup could not finish. Fix the problems above and try again.");
    process.exit(1);
}

if (warnings.length > 0) {
    console.log("Setup finished with warnings:");
    for (const warning of warnings) {
        console.log(`  - ${warning}`);
    }
    console.log("");
}

console.log("Next steps:");
console.log("  1. Open Api/tests/start.lua and add your bot token, client ID,");
console.log("     and development server ID(s).");
console.log("  2. Run: npm run Api");
console.log("");
