#!/usr/bin/env node
import { Command } from "commander";
import { loadEnvironment } from "../services/config.js";
import { linkCommand } from "../commands/link.js";
import { pullCommand } from "../commands/pull.js";
import { planCommand } from "../commands/plan.js";
import { syncCommand } from "../commands/sync.js";
import { chatCommand } from "../commands/chat.js";
import { modelCommand } from "../commands/model.js";
import { loginCommand } from "../commands/login.js";
import { logoutCommand } from "../commands/logout.js";
import { whoamiCommand } from "../commands/whoami.js";
import { doctorCommand } from "../commands/doctor.js";
import { unlinkCommand } from "../commands/unlink.js";
// Load environment variables (.env, .env.local, ../app/.env.local)
loadEnvironment(process.cwd());
const program = new Command();
program
    .name("koda")
    .description("KODA AI Coding Agent CLI — Spec-driven development connected with KODA PRD ecosystem")
    .version("0.1.0");
program
    .command("login")
    .description("Masuk ke akun KODA menggunakan Google di browser")
    .action(async () => {
    await loginCommand();
});
program
    .command("logout")
    .description("Keluar dari akun KODA aktif di terminal")
    .action(async () => {
    await logoutCommand();
});
program
    .command("whoami")
    .description("Tampilkan profil akun KODA yang sedang aktif")
    .action(async () => {
    await whoamiCommand();
});
program
    .command("doctor")
    .alias("status")
    .description("Periksa kesehatan koneksi cloud, AI provider, dan status workspace")
    .action(async () => {
    await doctorCommand();
});
program
    .command("link [prdIdOrUrl]")
    .description("Hubungkan direktori kerja ini dengan dokumen PRD di KODA Web / Supabase")
    .action(async (prdIdOrUrl) => {
    await linkCommand(prdIdOrUrl);
});
program
    .command("unlink")
    .description("Putuskan hubungan direktori ini dari dokumen PRD KODA yang aktif")
    .action(async () => {
    await unlinkCommand();
});
program
    .command("pull")
    .description("Tarik spesifikasi dan update terbaru dari dokumen PRD yang terhubung")
    .action(async () => {
    await pullCommand();
});
program
    .command("plan")
    .description("Buat rencana kerja implementasi (.koda/plan.md) berdasarkan spesifikasi PRD")
    .action(async () => {
    await planCommand();
});
program
    .command("sync [message]")
    .description("Kirim catatan progress atau status pengerjaan ke KODA PRD Editor web")
    .action(async (message) => {
    await syncCommand(message);
});
program
    .command("model [provider] [apiKey]")
    .description("Konfigurasi AI Provider (Gemini, DeepSeek, OpenAI, Groq, Ollama)")
    .action(async (provider, apiKey) => {
    await modelCommand(provider, apiKey);
});
program
    .command("run <task...>")
    .description("Jalankan task coding spesifik secara langsung bersama agent")
    .action(async (taskParts) => {
    await chatCommand(taskParts.join(" "));
});
// Default action when no subcommand is specified
program
    .argument("[prompt...]", "Instruksi atau pertanyaan awal untuk agent")
    .action(async (promptParts) => {
    const initialPrompt = promptParts && promptParts.length > 0 ? promptParts.join(" ") : undefined;
    await chatCommand(initialPrompt);
});
program.parse(process.argv);
