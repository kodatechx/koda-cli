import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import os from "os";
import dotenv from "dotenv";
// Try loading environment variables from multiple candidates
export function loadEnvironment(cwd) {
    const candidates = [
        path.resolve(cwd, ".env"),
        path.resolve(cwd, ".env.local"),
        path.resolve(cwd, "../app/.env.local"),
        path.resolve(cwd, "../.env"),
        path.resolve(os.homedir(), ".koda/.env"),
    ];
    for (const c of candidates) {
        if (fsSync.existsSync(c)) {
            dotenv.config({ path: c });
        }
    }
}
export function getProjectConfigPath(cwd) {
    return path.resolve(cwd, ".koda/project.json");
}
export async function readProjectConfig(cwd) {
    const configPath = getProjectConfigPath(cwd);
    if (!fsSync.existsSync(configPath))
        return null;
    try {
        const raw = await fs.readFile(configPath, "utf-8");
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
export async function saveProjectConfig(cwd, config) {
    const configPath = getProjectConfigPath(cwd);
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
}
export function getGlobalConfigPath() {
    return path.resolve(os.homedir(), ".koda/config.json");
}
export async function getGlobalConfig() {
    const p = getGlobalConfigPath();
    if (!fsSync.existsSync(p))
        return {};
    try {
        const raw = await fs.readFile(p, "utf-8");
        return JSON.parse(raw);
    }
    catch {
        return {};
    }
}
export async function setGlobalConfig(key, value) {
    const p = getGlobalConfigPath();
    await fs.mkdir(path.dirname(p), { recursive: true });
    const current = await getGlobalConfig();
    current[key] = value;
    await fs.writeFile(p, JSON.stringify(current, null, 2), "utf-8");
}
