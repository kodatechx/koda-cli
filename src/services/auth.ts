import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import os from "os";

export interface AuthSession {
  token?: string;
  email: string;
  name: string;
  avatarUrl?: string;
  tier?: string;
  loggedInAt: string;
}

export function getAuthFilePath(): string {
  return path.resolve(os.homedir(), ".koda/auth.json");
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const p = getAuthFilePath();
  if (!fsSync.existsSync(p)) return null;
  try {
    const raw = await fs.readFile(p, "utf-8");
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export async function saveAuthSession(session: AuthSession): Promise<void> {
  const p = getAuthFilePath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(session, null, 2), "utf-8");
}

export async function clearAuthSession(): Promise<void> {
  const p = getAuthFilePath();
  if (fsSync.existsSync(p)) {
    try {
      await fs.unlink(p);
    } catch {}
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getAuthSession();
  return !!session?.email;
}
