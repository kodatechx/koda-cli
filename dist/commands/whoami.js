import chalk from "chalk";
import { getAuthSession } from "../services/auth.js";
import { getGlobalConfig } from "../services/config.js";
export async function whoamiCommand() {
    const session = await getAuthSession();
    const config = await getGlobalConfig();
    if (!session?.email) {
        console.log(chalk.yellow("\n⚠️  Anda belum login ke KODA."));
        console.log(chalk.dim("Jalankan ") + chalk.cyan("koda login") + chalk.dim(" untuk masuk dengan Google / Akun Koda.\n"));
        return;
    }
    const line = chalk.hex("#408175")("─".repeat(50));
    console.log("\n" + line);
    console.log(chalk.bold.hex("#408175")("  👤 Profil Pengguna KODA CLI"));
    console.log(line);
    console.log(`  Nama      : ${chalk.bold.white(session.name)}`);
    console.log(`  Email     : ${chalk.white(session.email)}`);
    console.log(`  Tier Plan : ${chalk.bold.hex("#408175")(session.tier || "PRO")}`);
    console.log(`  AI Engine : ${chalk.cyan(config.activeProvider?.toUpperCase() || "GEMINI")}`);
    console.log(`  Login at  : ${chalk.dim(new Date(session.loggedInAt).toLocaleString())}`);
    console.log(line + "\n");
}
