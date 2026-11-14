import chalk from "chalk";
import ora from "ora";
import { readProjectConfig } from "../services/config.js";
import { postPrdSyncComment } from "../services/koda-bridge.js";
import { askUserPrompt } from "../ui/terminal.js";

export async function syncCommand(message?: string) {
  const cwd = process.cwd();
  const config = await readProjectConfig(cwd);

  if (!config?.prdId) {
    console.log(chalk.yellow("No PRD linked to this directory."));
    console.log(chalk.dim("Run ") + chalk.cyan("koda link <prd-id>") + chalk.dim(" first."));
    return;
  }

  let textToSend = message?.trim();
  if (!textToSend) {
    textToSend = await askUserPrompt("Progress note or review comment to push to PRD: ");
  }

  if (!textToSend) {
    console.log(chalk.dim("Cancelled."));
    return;
  }

  const spinner = ora(`Pushing progress update to PRD [${config.prdId}]...`).start();
  const ok = await postPrdSyncComment(config.prdId, textToSend, "KODA Coding Agent (CLI)");

  if (ok) {
    spinner.succeed(chalk.green(`Progress comment successfully synced to KODA Web PRD Editor!`));
  } else {
    spinner.fail(chalk.red("Failed to sync comment. Check network or Supabase connection."));
  }
}
