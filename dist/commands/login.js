import http from "http";
import { exec } from "child_process";
import chalk from "chalk";
import ora from "ora";
import { saveAuthSession, getAuthSession } from "../services/auth.js";
import { printAuthScreen, askUserPrompt } from "../ui/terminal.js";
function openBrowser(url) {
    const platform = process.platform;
    let cmd = `xdg-open "${url}"`;
    if (platform === "darwin")
        cmd = `open "${url}"`;
    if (platform === "win32")
        cmd = `start "" "${url}"`;
    exec(cmd, () => {
        // Silently ignore browser launch errors (terminal link is already displayed)
    });
}
export async function loginCommand() {
    const existing = await getAuthSession();
    if (existing?.email) {
        console.log(chalk.green(`\n✓ Sudah login sebagai: ${chalk.bold(existing.name || existing.email)} (${existing.email}) [${existing.tier || "PRO"}]`));
        console.log(chalk.dim("Jalankan 'koda logout' jika ingin berganti akun.\n"));
        return;
    }
    const port = 54321;
    const state = Math.random().toString(36).substring(2, 15);
    const webBaseUrl = process.env.KODA_WEB_URL || "https://kodaaistudio.vercel.app";
    const loginUrl = `${webBaseUrl}/auth/cli?port=${port}&state=${state}`;
    printAuthScreen(loginUrl);
    openBrowser(loginUrl);
    const spinner = ora(chalk.dim("Menunggu otorisasi dari browser... (atau paste kode di bawah)")).start();
    return new Promise((resolve) => {
        let resolved = false;
        const cleanup = () => {
            if (!resolved) {
                resolved = true;
                server.close();
            }
        };
        // 1. Local HTTP Loopback Server
        const server = http.createServer(async (req, res) => {
            const reqUrl = new URL(req.url || "", `http://127.0.0.1:${port}`);
            // Handle CORS preflight
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");
            if (req.method === "OPTIONS") {
                res.writeHead(204);
                res.end();
                return;
            }
            if (reqUrl.pathname === "/callback") {
                let authData = null;
                if (req.method === "POST") {
                    let body = "";
                    for await (const chunk of req) {
                        body += chunk;
                    }
                    try {
                        authData = JSON.parse(body);
                    }
                    catch { }
                }
                else if (req.method === "GET") {
                    authData = {
                        token: reqUrl.searchParams.get("token") || "",
                        email: reqUrl.searchParams.get("email") || "",
                        name: reqUrl.searchParams.get("name") || "",
                        state: reqUrl.searchParams.get("state") || "",
                    };
                }
                if (authData?.email) {
                    const session = {
                        token: authData.token,
                        email: authData.email,
                        name: authData.name || authData.email.split("@")[0],
                        avatarUrl: authData.avatarUrl,
                        tier: authData.tier || "PRO",
                        loggedInAt: new Date().toISOString(),
                    };
                    await saveAuthSession(session);
                    // Success HTML to browser
                    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                    res.end(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Otorisasi KODA Berhasil</title>
  <style>
    body { background: #141413; color: white; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    .card { background: #1c1c1a; border: 1px solid #2b2b28; padding: 48px; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); max-width: 440px; }
    h1 { color: #408175; margin-bottom: 8px; font-size: 22px; }
    p { color: #9aa0a6; font-size: 14px; line-height: 1.6; }
    .badge { display: inline-block; background: rgba(64,129,117,0.15); border: 1px solid rgba(64,129,117,0.3); color: #408175; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: bold; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>✔ Otorisasi Berhasil!</h1>
    <p>Terminal KODA CLI Anda telah aktif dan terhubung dengan akun Anda. Anda dapat menutup tab ini sekarang.</p>
    <div class="badge">KODA AGENT ACTIVE</div>
  </div>
</body>
</html>`);
                    spinner.succeed(chalk.green(`Login berhasil! Selamat datang, ${chalk.bold(session.name)} (${session.email})`));
                    console.log(chalk.hex("#408175")(`  Plan Tier: `) + chalk.bold.white(session.tier) + chalk.dim(` | Session tersimpan di ~/.koda/auth.json\n`));
                    cleanup();
                    resolve();
                    return;
                }
                res.writeHead(400, { "Content-Type": "text/plain" });
                res.end("Invalid callback data");
                return;
            }
            res.writeHead(404);
            res.end();
        });
        server.listen(port, "127.0.0.1", () => {
            // Prompt user in case they want to paste manual code
            askUserPrompt("Kode Otorisasi (jika browser tidak otomatis): ").then((val) => {
                if (resolved)
                    return;
                const code = val.trim();
                if (code.startsWith("koda_auth_")) {
                    try {
                        const rawB64 = code.replace("koda_auth_", "");
                        const payload = JSON.parse(Buffer.from(rawB64, "base64").toString("utf-8"));
                        if (payload.email) {
                            const session = {
                                token: payload.token,
                                email: payload.email,
                                name: payload.name || "Koda Developer",
                                tier: payload.tier || "PRO",
                                loggedInAt: new Date().toISOString(),
                            };
                            saveAuthSession(session).then(() => {
                                spinner.succeed(chalk.green(`Login berhasil! Selamat datang, ${chalk.bold(session.name)} (${session.email})`));
                                cleanup();
                                resolve();
                            });
                            return;
                        }
                    }
                    catch { }
                }
            });
        });
        server.on("error", () => {
            // If port is occupied, prompt for manual code
            spinner.info(chalk.yellow(`Port ${port} sedang digunakan. Silakan salin & tempel Kode Otorisasi dari browser.`));
            askUserPrompt("Kode Otorisasi: ").then((code) => {
                if (code.startsWith("koda_auth_")) {
                    try {
                        const rawB64 = code.replace("koda_auth_", "");
                        const payload = JSON.parse(Buffer.from(rawB64, "base64").toString("utf-8"));
                        if (payload.email) {
                            const session = {
                                token: payload.token,
                                email: payload.email,
                                name: payload.name || "Koda Developer",
                                tier: payload.tier || "PRO",
                                loggedInAt: new Date().toISOString(),
                            };
                            saveAuthSession(session).then(() => {
                                console.log(chalk.green(`\n✔ Login berhasil! Selamat datang, ${session.name} (${session.email})\n`));
                                cleanup();
                                resolve();
                            });
                            return;
                        }
                    }
                    catch { }
                }
                cleanup();
                resolve();
            });
        });
    });
}
