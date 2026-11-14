import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import chalk from "chalk";
import { readProjectConfig } from "../services/config.js";
import { getAuthSession } from "../services/auth.js";
import { runAgentLoop } from "../agent/loop.js";
import { printBanner, askUserPrompt } from "../ui/terminal.js";
import { pullCommand } from "./pull.js";
import { planCommand } from "./plan.js";
import { syncCommand } from "./sync.js";
import { loginCommand } from "./login.js";
import { whoamiCommand } from "./whoami.js";
import { doctorCommand } from "./doctor.js";
import { unlinkCommand } from "./unlink.js";
export async function chatCommand(initialPrompt) {
    const cwd = process.cwd();
    const config = await readProjectConfig(cwd);
    const auth = await getAuthSession();
    printBanner(config, auth);
    const context = { cwd, projectConfig: config };
    let history = [];
    // If user passed a single prompt argument (e.g. koda "fix the auth bug")
    if (initialPrompt && initialPrompt.trim().length > 0) {
        console.log("  " + chalk.bold.hex("#D97757")(`koda ❯ `) + chalk.white(initialPrompt));
        const res = await runAgentLoop(initialPrompt, context, history);
        history = res.history;
        console.log("");
    }
    console.log("  " +
        chalk.dim("Type your request or use slash commands (") +
        chalk.cyan("/help") +
        chalk.dim(", ") +
        chalk.cyan("/specs") +
        chalk.dim(", ") +
        chalk.cyan("/plan") +
        chalk.dim(", ") +
        chalk.cyan("/login") +
        chalk.dim(", ") +
        chalk.cyan("/exit") +
        chalk.dim("):\n"));
    while (true) {
        const input = await askUserPrompt();
        const trimmed = input.trim();
        if (!trimmed)
            continue;
        // Handle slash commands
        if (trimmed === "/exit" || trimmed === "exit" || trimmed === "quit") {
            console.log("  " + chalk.hex("#408175")("Sampai jumpa! Selamat coding bersama KODA.\n"));
            break;
        }
        if (trimmed === "/clear") {
            history = [];
            console.clear();
            const currentAuth = await getAuthSession();
            printBanner(config, currentAuth);
            console.log("  " + chalk.green("Conversation history cleared.\n"));
            continue;
        }
        if (trimmed === "/login") {
            await loginCommand();
            console.log("");
            continue;
        }
        if (trimmed === "/whoami") {
            await whoamiCommand();
            continue;
        }
        if (trimmed === "/doctor" || trimmed === "/status") {
            await doctorCommand();
            continue;
        }
        if (trimmed === "/help") {
            console.log(chalk.bold("\nAvailable Commands:"));
            console.log(`  ${chalk.cyan("/specs")}   - Tampilkan spesifikasi PRD yang terhubung`);
            console.log(`  ${chalk.cyan("/plan")}    - Buat / perbarui rencana implementasi (.koda/plan.md)`);
            console.log(`  ${chalk.cyan("/pull")}    - Ambil update PRD terbaru dari KODA Web Cloud`);
            console.log(`  ${chalk.cyan("/sync")}    - Kirim catatan progress ke KODA Web Editor`);
            console.log(`  ${chalk.cyan("/login")}   - Masuk dengan akun Google / KODA Web`);
            console.log(`  ${chalk.cyan("/whoami")}  - Tampilkan profil pengguna yang aktif`);
            console.log(`  ${chalk.cyan("/doctor")}  - Periksa status sistem, git, dan AI model`);
            console.log(`  ${chalk.cyan("/unlink")}  - Putuskan hubungan direktori ini dari PRD aktif`);
            console.log(`  ${chalk.cyan("/clear")}   - Bersihkan riwayat chat saat ini`);
            console.log(`  ${chalk.cyan("/exit")}    - Keluar dari CLI\n`);
            continue;
        }
        if (trimmed === "/unlink") {
            await unlinkCommand();
            context.projectConfig = null;
            continue;
        }
        if (trimmed === "/specs") {
            const specsPath = path.resolve(cwd, ".koda/specs.md");
            if (fsSync.existsSync(specsPath)) {
                const content = await fs.readFile(specsPath, "utf-8");
                console.log("\n" + chalk.cyan("--- .koda/specs.md ---"));
                console.log(content.slice(0, 3000));
                if (content.length > 3000)
                    console.log(chalk.dim(`\n... (${content.length - 3000} more characters)`));
                console.log(chalk.cyan("----------------------\n"));
            }
            else {
                console.log(chalk.yellow("Belum ada file .koda/specs.md. Jalankan 'koda link' terlebih dahulu.\n"));
            }
            continue;
        }
        if (trimmed === "/pull") {
            await pullCommand();
            console.log("");
            continue;
        }
        if (trimmed === "/plan") {
            await planCommand();
            console.log("");
            continue;
        }
        if (trimmed === "/sync") {
            await syncCommand();
            console.log("");
            continue;
        }
        // Normal message -> Agent Loop
        const res = await runAgentLoop(trimmed, context, history);
        history = res.history;
        console.log("");
    }
}
