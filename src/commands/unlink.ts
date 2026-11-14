import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import chalk from "chalk";
import { readProjectConfig } from "../services/config.js";

export async function unlinkCommand() {
  const cwd = process.cwd();
  const config = await readProjectConfig(cwd);

  if (!config?.prdId) {
    console.log(chalk.yellow("\nℹ️ Proyek di direktori ini belum terhubung ke dokumen PRD mana pun.\n"));
    return;
  }

  const kodaDir = path.resolve(cwd, ".koda");
  const projectJson = path.resolve(kodaDir, "project.json");

  try {
    if (fsSync.existsSync(projectJson)) {
      await fs.unlink(projectJson);
    }
    console.log(
      chalk.green("\n✓ Berhasil memutuskan hubungan PRD: ") +
        chalk.bold.white(config.title || config.prdId)
    );
    console.log(
      chalk.dim("Direktori ini sekarang bersih. Anda bisa menghubungkan PRD lain menggunakan: ") +
        chalk.cyan("koda link <prd-id-or-url>\n")
    );
  } catch (err: any) {
    console.log(chalk.red(`\nGagal memutuskan hubungan PRD: ${err.message}\n`));
  }
}
