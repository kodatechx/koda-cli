import fs from "fs/promises";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { fetchPrdDocument, listRecentPrdDocuments } from "../services/koda-bridge.js";
import { saveProjectConfig } from "../services/config.js";
import { askSelection } from "../ui/terminal.js";

export async function linkCommand(prdIdOrUrl?: string) {
  const cwd = process.cwd();
  let targetId = prdIdOrUrl?.trim();

  // If no ID provided, list recent PRDs from Supabase for interactive selection
  if (!targetId) {
    const spinner = ora("Fetching recent PRD documents from KODA Cloud...").start();
    const recent = await listRecentPrdDocuments();
    spinner.stop();

    if (recent.length === 0) {
      console.log(chalk.yellow("No recent PRDs found or Supabase not reachable."));
      console.log(chalk.dim("Usage: koda link <prd-id-or-url>"));
      return;
    }

    targetId = await askSelection(
      "Pilih dokumen PRD yang ingin dihubungkan:",
      recent.map((r) => ({
        name: `${r.title} ${chalk.dim(`(${r.id})`)}`,
        value: r.id,
      }))
    );
  }

  const spinner = ora(`Connecting to KODA PRD [${targetId}]...`).start();
  const prd = await fetchPrdDocument(targetId);

  if (!prd) {
    spinner.fail(chalk.red(`Failed to find PRD with ID: ${targetId}`));
    console.log(chalk.dim("Please verify the PRD ID or URL from your KODA Editor browser address bar."));
    return;
  }

  // Save project configuration
  await saveProjectConfig(cwd, {
    prdId: prd.id,
    title: prd.title,
    version: "1.0.0",
    linkedAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  });

  // Save local copy of specs
  const kodaDir = path.resolve(cwd, ".koda");
  await fs.mkdir(kodaDir, { recursive: true });
  const specsContent = `# ${prd.title}
*Linked from KODA PRD Ecosystem (ID: ${prd.id})*
*Last Synced: ${new Date().toLocaleString()}*

---

${prd.markdownContent || prd.documentHtml.replace(/<[^>]+>/g, " ")}
`;
  await fs.writeFile(path.resolve(kodaDir, "specs.md"), specsContent, "utf-8");

  spinner.succeed(chalk.green(`Successfully linked to PRD: "${prd.title}"`));
  console.log(chalk.cyan(`\n📁 Created:`));
  console.log(`   - ${chalk.bold(".koda/project.json")} (Ecosystem metadata)`);
  console.log(`   - ${chalk.bold(".koda/specs.md")} (Single Source of Truth)\n`);
  console.log(chalk.dim("Next steps:"));
  console.log(`   Run ${chalk.cyan("koda plan")} to generate an implementation checklist.`);
  console.log(`   Run ${chalk.cyan("koda")} to start coding with the AI agent.\n`);
}
