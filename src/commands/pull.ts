import fs from "fs/promises";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { readProjectConfig, saveProjectConfig } from "../services/config.js";
import { fetchPrdDocument } from "../services/koda-bridge.js";

export async function pullCommand() {
  const cwd = process.cwd();
  const config = await readProjectConfig(cwd);

  if (!config?.prdId) {
    console.log(chalk.yellow("No PRD linked to this directory."));
    console.log(chalk.dim("Run ") + chalk.cyan("koda link <prd-id>") + chalk.dim(" first."));
    return;
  }

  const spinner = ora(`Pulling latest specs for PRD: "${config.title}" (${config.prdId})...`).start();
  const prd = await fetchPrdDocument(config.prdId);

  if (!prd) {
    spinner.fail(chalk.red("Failed to pull PRD from KODA cloud. Please check connection."));
    return;
  }

  const specsPath = path.resolve(cwd, ".koda/specs.md");
  const content = `# ${prd.title}
*Linked from KODA PRD Ecosystem (ID: ${prd.id})*
*Last Synced: ${new Date().toLocaleString()}*

---

${prd.markdownContent || prd.documentHtml.replace(/<[^>]+>/g, " ")}
`;

  await fs.writeFile(specsPath, content, "utf-8");

  config.lastSyncedAt = new Date().toISOString();
  config.title = prd.title;
  await saveProjectConfig(cwd, config);

  spinner.succeed(chalk.green(`Updated .koda/specs.md with latest PRD changes!`));
}
