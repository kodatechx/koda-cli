import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import chalk from "chalk";
import { readProjectConfig } from "../services/config.js";
import { runAgentLoop } from "../agent/loop.js";
export async function planCommand() {
    const cwd = process.cwd();
    const config = await readProjectConfig(cwd);
    const specsPath = path.resolve(cwd, ".koda/specs.md");
    if (!fsSync.existsSync(specsPath)) {
        console.log(chalk.yellow("No specifications found at .koda/specs.md."));
        console.log(chalk.dim("Run ") + chalk.cyan("koda link") + chalk.dim(" or create .koda/specs.md first."));
        return;
    }
    const specs = await fs.readFile(specsPath, "utf-8");
    console.log(chalk.bold.hex("#408175")("\n📋 KODA Implementation Planner"));
    console.log(chalk.dim("Analyzing PRD specifications and local directory structure...\n"));
    const context = { cwd, projectConfig: config };
    const prompt = `Please analyze the linked PRD specs and existing codebase files:
1. Break down the requirements into clear, ordered implementation phases (Phase 1: Setup/Architecture, Phase 2: Core Data/API, Phase 3: UI/Components, Phase 4: Testing & Verification).
2. Create or write the implementation plan to '.koda/plan.md' using write_to_file with checkbox tasks like "- [ ] Task description".
3. Provide a concise summary to the user.

PRD Specifications:
${specs.slice(0, 4000)}
`;
    await runAgentLoop(prompt, context);
    console.log(chalk.green("\n✓ Implementation plan saved to .koda/plan.md"));
    console.log(chalk.dim("Run 'koda' to start executing tasks autonomously!"));
}
