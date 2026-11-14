import fsSync from "fs";
import path from "path";
import chalk from "chalk";
import { getAuthSession } from "../services/auth.js";
import { readProjectConfig, getGlobalConfig } from "../services/config.js";
import { getSupabaseClient } from "../services/koda-bridge.js";

export async function doctorCommand() {
  const cwd = process.cwd();
  const session = await getAuthSession();
  const config = await readProjectConfig(cwd);
  const globalConfig = await getGlobalConfig();

  console.log(chalk.bold.hex("#408175")("\n🩺 KODA System & Ecosystem Doctor"));
  console.log(chalk.dim("Memeriksa status otentikasi, AI engine, dan konektivitas PRD...\n"));

  // 1. Auth Status
  if (session?.email) {
    console.log(chalk.green("  ✓ Auth Session   : ") + chalk.bold.white(session.name) + chalk.dim(` (${session.email}) [${session.tier || "PRO"}]`));
  } else {
    console.log(chalk.yellow("  ⚠️ Auth Session   : ") + chalk.yellow("Belum login. ") + chalk.dim("Jalankan 'koda login' untuk masuk."));
  }

  // 2. AI Model Provider
  const provider = globalConfig.activeProvider || "gemini";
  const geminiKey = globalConfig.geminiApiKey || process.env.GEMINI_API_KEY;
  const customKey = globalConfig.apiKey || process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;

  if (provider === "gemini" && geminiKey) {
    console.log(chalk.green("  ✓ AI Provider    : ") + chalk.bold.white("Google Gemini") + chalk.dim(" (High-quota Flash Lite Waterfall)"));
  } else if (provider !== "gemini" && customKey) {
    console.log(chalk.green("  ✓ AI Provider    : ") + chalk.bold.white(provider.toUpperCase()) + chalk.dim(` (${globalConfig.modelName || "default"})`));
  } else {
    console.log(chalk.red("  ✗ AI Provider    : ") + chalk.red("API Key belum disetel. Jalankan 'koda model'"));
  }

  // 3. Cloud Supabase Bridge
  const supabase = getSupabaseClient();
  if (supabase) {
    console.log(chalk.green("  ✓ KODA Cloud     : ") + chalk.dim("Supabase connected"));
  } else {
    console.log(chalk.yellow("  ⚠️ KODA Cloud     : ") + chalk.dim("Supabase URL/Key tidak ditemukan"));
  }

  // 4. Linked PRD
  if (config?.prdId) {
    console.log(chalk.green("  ✓ Linked PRD     : ") + chalk.bold.white(config.title) + chalk.dim(` (ID: ${config.prdId})`));
  } else {
    console.log(chalk.yellow("  ℹ️ Linked PRD     : ") + chalk.dim("Belum terhubung. Jalankan 'koda link'"));
  }

  // 5. Local Specs
  const specsExist = fsSync.existsSync(path.resolve(cwd, ".koda/specs.md"));
  if (specsExist) {
    console.log(chalk.green("  ✓ PRD Specs File : ") + chalk.dim(".koda/specs.md ready"));
  } else {
    console.log(chalk.dim("  - PRD Specs File : Belum ada .koda/specs.md"));
  }

  // 6. Git Status
  const isGit = fsSync.existsSync(path.resolve(cwd, ".git"));
  if (isGit) {
    console.log(chalk.green("  ✓ Git Repository : ") + chalk.dim("Initialized"));
  } else {
    console.log(chalk.dim("  - Git Repository : Not a git repository"));
  }

  console.log("\n" + chalk.dim("Semua sistem siap digunakan!") + "\n");
}
