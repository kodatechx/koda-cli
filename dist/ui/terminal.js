import chalk from "chalk";
import fsSync from "fs";
import path from "path";
import readline from "node:readline";
import { select as inquirerSelect } from "@inquirer/prompts";
export function terminalHyperlink(text, url) {
    return `\u001b]8;;${url}\u001b\\${text}\u001b]8;;\u001b\\`;
}
// Iconic Segmented Circuit-Block KODA CODE Terminal Typography
// Replicates the modular retro-futuristic terracotta brick and copper trace aesthetic
export function printKodaLogoArt() {
    const t = (s) => chalk.hex("#D97757")(s); // Terracotta brick fill
    const c = (s) => chalk.hex("#94442A")(s); // Copper circuit trace line
    const d = (s) => chalk.hex("#7B301B")(s); // Subtle circuit trace dot
    // Word 1: KODA (16 characters per letter)
    const K = [
        t("████") + "        " + t("████"),
        c("│  │") + "        " + c("│  │"),
        t("████") + "      " + t("████") + "  ",
        c("│  ├───┬──╯") + "     ",
        t("██████████") + "      ",
        c("│  ├───┴──╮") + "     ",
        t("████") + "      " + t("████") + "  ",
        c("│  │") + "        " + c("│  │"),
        t("████") + "        " + t("████"),
    ];
    const O = [
        "  " + t("████████████") + "  ",
        c("╭─┴──────────┴─╮"),
        t("████") + "        " + t("████"),
        c("│  │") + "        " + c("│  │"),
        t("████") + "        " + t("████"),
        c("│  │") + "        " + c("│  │"),
        t("████") + "        " + t("████"),
        c("╰─┬──────────┬─╯"),
        "  " + t("████████████") + "  ",
    ];
    const D = [
        t("████████████") + "    ",
        c("│  ┌─────────╮") + "  ",
        t("████") + "        " + t("████"),
        c("│  │") + "        " + c("│  │"),
        t("████") + "        " + t("████"),
        c("│  │") + "        " + c("│  │"),
        t("████") + "        " + t("████"),
        c("│  └─────────╯") + "  ",
        t("████████████") + "    ",
    ];
    const A = [
        "    " + t("████████") + "    ",
        c("╭───┴──────┴───╮"),
        t("████") + "        " + t("████"),
        c("│  ├───┬──┬──┤ │"),
        t("████████████████"),
        c("│  │") + "        " + c("│  │"),
        t("████") + "        " + t("████"),
        c("│  │") + "        " + c("│  │"),
        t("████") + "        " + t("████"),
    ];
    // Word 2: CODE (16 characters per letter)
    const C = [
        "  " + t("██████████████"),
        c("╭─┴────────────╯"),
        t("████") + "            ",
        c("│  │") + d("   ·········"),
        t("████") + "            ",
        c("│  │") + d("   ·········"),
        t("████") + "            ",
        c("╰─┬────────────╮"),
        "  " + t("██████████████"),
    ];
    const E = [
        t("████████████████"),
        c("│  ┌───────────╯"),
        t("████") + "            ",
        c("│  ├───┬────────"),
        t("████████████") + "    ",
        c("│  ├───┴────────"),
        t("████") + "            ",
        c("│  └───────────╮"),
        t("████████████████"),
    ];
    console.log("");
    for (let i = 0; i < 9; i++) {
        console.log("   " + [K[i], O[i], D[i], A[i]].join("  "));
    }
    console.log("");
    for (let i = 0; i < 9; i++) {
        console.log("   " + [C[i], O[i], D[i], E[i]].join("  "));
    }
    console.log("");
}
export function printBanner(config, auth) {
    printKodaLogoArt();
    const line = chalk.hex("#94442A")("─".repeat(70));
    console.log("   " + line);
    console.log("   " +
        chalk.bold.hex("#D97757")("⚡ KODA CODE ") +
        chalk.bold.white("AI Agent CLI ") +
        chalk.dim("v0.1.0 ") +
        chalk.hex("#408175").bold("[PRD ECOSYSTEM]"));
    console.log(chalk.dim("   Spec-driven development paired with KODA Web"));
    // Auth User Line
    if (auth?.email) {
        console.log("   " +
            chalk.hex("#D97757")("👤 User: ") +
            chalk.bold.white(auth.name || auth.email) +
            chalk.dim(` (${auth.email}) `) +
            chalk.green.bold(`[${auth.tier || "PRO"}]`));
    }
    else {
        console.log("   " +
            chalk.dim("👤 Account: ") +
            chalk.yellow("Not logged in. ") +
            chalk.dim("Run ") +
            chalk.cyan("koda login") +
            chalk.dim(" to connect with Google / KODA Web."));
    }
    // PRD Line
    if (config?.prdId) {
        console.log("   " +
            chalk.hex("#408175")("🔗 Linked PRD: ") +
            chalk.bold.white(config.title || config.prdId) +
            chalk.dim(` [ID: ${config.prdId}]`));
    }
    else {
        console.log("   " +
            chalk.dim("📁 Project: ") +
            chalk.yellow("No PRD linked. ") +
            chalk.dim("Run ") +
            chalk.cyan("koda link <prd-id>") +
            chalk.dim(" to connect specs."));
    }
    // Check active plan (.koda/plan.md)
    const planPath = path.resolve(process.cwd(), ".koda/plan.md");
    if (fsSync.existsSync(planPath)) {
        try {
            const planRaw = fsSync.readFileSync(planPath, "utf-8");
            const totalTasks = (planRaw.match(/- \[[ xX]\]/g) || []).length;
            const doneTasks = (planRaw.match(/- \[[xX]\]/g) || []).length;
            console.log("   " +
                chalk.hex("#E88C6F")("📋 Active Plan: ") +
                chalk.bold.white(".koda/plan.md ") +
                chalk.dim(`(${doneTasks}/${totalTasks} checklist selesai)`));
            console.log("   " +
                chalk.dim("💡 Prompt Tips: Ketik ") +
                chalk.cyan('"jalankan plan"') +
                chalk.dim(" atau ") +
                chalk.cyan('"kerjakan task berikutnya"') +
                chalk.dim(" untuk coding otomatis."));
        }
        catch { }
    }
    console.log("   " + line + "\n");
}
export function printAuthScreen(loginUrl) {
    console.clear();
    printKodaLogoArt();
    console.log(chalk.bold.white("  A browser window will open for authentication.\n"));
    const clickable = terminalHyperlink(chalk.cyan.underline("Click here to open in browser"), loginUrl);
    console.log(chalk.dim("  If it doesn't open automatically:"));
    console.log(`  👉 ${clickable}\n`);
    console.log(chalk.dim("  Full URL (if terminal does not support clickable links):"));
    console.log(`  ${chalk.dim(loginUrl)}\n`);
    const line = chalk.hex("#94442A")("─".repeat(70));
    console.log("   " + line);
    console.log(chalk.dim("   Waiting for authorization from browser or paste manual code..."));
    console.log("   " + line + "\n");
}
export function formatTerminalMarkdown(text) {
    if (!text)
        return "";
    const lines = text.split("\n");
    const output = [];
    let inCodeBlock = false;
    let codeBlockLang = "";
    for (const line of lines) {
        if (line.trim().startsWith("```")) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeBlockLang = line.trim().slice(3).trim();
                output.push(chalk.dim("  ╭─ ") +
                    chalk.cyan(codeBlockLang || "code") +
                    chalk.dim(" " + "─".repeat(Math.max(10, 56 - (codeBlockLang?.length || 4)))));
            }
            else {
                inCodeBlock = false;
                output.push(chalk.dim("  ╰─" + "─".repeat(60)));
            }
            continue;
        }
        if (inCodeBlock) {
            output.push(chalk.dim("  │ ") + chalk.hex("#e2e8f0")(line));
            continue;
        }
        // Headers
        if (line.startsWith("### ")) {
            output.push("\n  " + chalk.bold.hex("#D97757")("▶ " + line.slice(4)));
            continue;
        }
        if (line.startsWith("## ")) {
            output.push("\n  " + chalk.bold.hex("#D97757")("■ " + line.slice(3)));
            continue;
        }
        if (line.startsWith("# ")) {
            output.push("\n  " + chalk.bold.hex("#D97757")("● " + line.slice(2)));
            continue;
        }
        // Horizontal rule
        if (/^(\-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
            output.push("  " + chalk.hex("#94442A")("─".repeat(65)));
            continue;
        }
        // Blockquote
        if (line.startsWith("> ")) {
            output.push("  " + chalk.hex("#408175")("│ ") + chalk.dim.italic(line.slice(2)));
            continue;
        }
        let formatted = line;
        // Bullet points
        if (/^\s*[\*\-]\s+/.test(formatted)) {
            formatted = formatted.replace(/^(\s*)[\*\-]\s+/, "$1  " + chalk.hex("#408175")("• "));
        }
        else if (/^\s*\d+\.\s+/.test(formatted)) {
            formatted = formatted.replace(/^(\s*)(\d+)\.\s+/, (_, space, num) => space + "  " + chalk.hex("#408175")(`${num}. `));
        }
        else if (formatted.trim().length > 0) {
            formatted = "  " + formatted;
        }
        // Bold: **text**
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, (_, b) => chalk.bold.white(b));
        // Inline code: `code`
        formatted = formatted.replace(/`([^`]+)`/g, (_, c) => chalk.hex("#E58B6D").bgHex("#241c1a")(` ${c} `));
        output.push(formatted);
    }
    return output.join("\n");
}
export function printToolStart(name, args) {
    switch (name) {
        case "run_command": {
            const cmd = args.CommandLine || "";
            console.log("  " +
                chalk.hex("#408175")("╭─ ⚡ ") +
                chalk.bold.white("Run: ") +
                chalk.hex("#E58B6D")(cmd.length > 90 ? cmd.slice(0, 90) + "..." : cmd));
            break;
        }
        case "view_file": {
            const file = args.FilePath || "";
            const range = args.StartLine
                ? ` (lines ${args.StartLine}-${args.EndLine || "end"})`
                : "";
            console.log("  " +
                chalk.hex("#408175")("╭─ 📖 ") +
                chalk.bold.white("Read: ") +
                chalk.cyan(file) +
                chalk.dim(range));
            break;
        }
        case "replace_file_content": {
            const file = args.TargetFile || "";
            console.log("  " +
                chalk.hex("#408175")("╭─ ✏️  ") +
                chalk.bold.white("Edit: ") +
                chalk.cyan(file));
            break;
        }
        case "write_to_file": {
            const file = args.TargetFile || "";
            console.log("  " +
                chalk.hex("#408175")("╭─ 📄 ") +
                chalk.bold.white("Write: ") +
                chalk.cyan(file));
            break;
        }
        case "list_dir": {
            const dir = args.DirectoryPath || "./";
            console.log("  " +
                chalk.hex("#408175")("╭─ 📁 ") +
                chalk.bold.white("List Directory: ") +
                chalk.cyan(dir));
            break;
        }
        case "grep_search": {
            console.log("  " +
                chalk.hex("#408175")("╭─ 🔍 ") +
                chalk.bold.white("Search: ") +
                chalk.yellow(`"${args.Query}"`) +
                chalk.dim(` in ${args.SearchPath || "."}`));
            break;
        }
        case "find_by_name": {
            console.log("  " +
                chalk.hex("#408175")("╭─ 🔎 ") +
                chalk.bold.white("Find Files: ") +
                chalk.yellow(`"${args.Pattern}"`) +
                chalk.dim(` in ${args.SearchDirectory || "."}`));
            break;
        }
        case "fetch_prd_spec": {
            console.log("  " +
                chalk.hex("#408175")("╭─ 🔗 ") +
                chalk.bold.white("Fetch PRD Specification ") +
                (args.prdId ? chalk.dim(`[${args.prdId}]`) : ""));
            break;
        }
        case "sync_prd_progress": {
            console.log("  " +
                chalk.hex("#408175")("╭─ ☁️  ") +
                chalk.bold.white("Sync Progress to KODA PRD Cloud"));
            break;
        }
        default: {
            console.log("  " +
                chalk.hex("#408175")("╭─ 🛠️  ") +
                chalk.bold.white(name) +
                chalk.dim(` (${Object.keys(args).join(", ")})`));
        }
    }
}
export function printToolDone(name, success, output, args = {}) {
    if (!success) {
        const errMsg = output.trim().split("\n")[0] || "Tool failed";
        console.log("  " +
            chalk.red("╰─ ✗ Failed: ") +
            chalk.dim(errMsg.slice(0, 100)) +
            "\n");
        return;
    }
    switch (name) {
        case "replace_file_content": {
            const lines = output.split("\n");
            const changeLines = lines.filter((l) => {
                const clean = l.replace(/\u001b\[\d+m/g, "").trim();
                return ((clean.startsWith("+") && !clean.startsWith("+++")) ||
                    (clean.startsWith("-") && !clean.startsWith("---")));
            });
            if (changeLines.length > 0) {
                for (const line of changeLines.slice(0, 8)) {
                    console.log("  " + chalk.hex("#408175")("│  ") + line);
                }
                if (changeLines.length > 8) {
                    console.log("  " +
                        chalk.hex("#408175")("│  ") +
                        chalk.dim(`... (${changeLines.length - 8} more modified lines)`));
                }
            }
            console.log("  " +
                chalk.green("╰─ ✓ Updated ") +
                chalk.bold.white(args.TargetFile || "") +
                "\n");
            break;
        }
        case "run_command": {
            const lines = output.trim().split("\n").filter((l) => l.trim().length > 0);
            if (lines.length > 0) {
                for (const l of lines.slice(0, 3)) {
                    console.log("  " +
                        chalk.hex("#408175")("│  ") +
                        chalk.dim(l.slice(0, 90)));
                }
                if (lines.length > 3) {
                    console.log("  " +
                        chalk.hex("#408175")("│  ") +
                        chalk.dim(`... (${lines.length - 3} more lines)`));
                }
            }
            console.log("  " +
                chalk.green("╰─ ✓ Command finished") +
                "\n");
            break;
        }
        case "view_file": {
            const total = output.split("\n").length;
            console.log("  " +
                chalk.green("╰─ ✓ Read ") +
                chalk.bold.white(`${Math.max(1, total - 1)} lines`) +
                chalk.dim(` from ${args.FilePath || ""}`) +
                "\n");
            break;
        }
        case "write_to_file": {
            const lineCount = (args.Content || "").split("\n").length;
            console.log("  " +
                chalk.green("╰─ ✓ Wrote ") +
                chalk.bold.white(`${lineCount} lines`) +
                chalk.dim(` to ${args.TargetFile || ""}`) +
                "\n");
            break;
        }
        case "list_dir": {
            const count = output.split("\n").length - 1;
            console.log("  " +
                chalk.green("╰─ ✓ Found ") +
                chalk.bold.white(`${Math.max(0, count)} entries`) +
                "\n");
            break;
        }
        case "grep_search": {
            const count = output.split("\n").filter((l) => l.trim().length > 0).length;
            console.log("  " +
                chalk.green("╰─ ✓ Found ") +
                chalk.bold.white(`${count} matches`) +
                "\n");
            break;
        }
        case "find_by_name": {
            const count = output.split("\n").filter((l) => l.trim().length > 0).length;
            console.log("  " +
                chalk.green("╰─ ✓ Found ") +
                chalk.bold.white(`${count} matching files`) +
                "\n");
            break;
        }
        case "fetch_prd_spec": {
            const lines = output.split("\n").length;
            console.log("  " +
                chalk.green("╰─ ✓ Specifications loaded ") +
                chalk.dim(`(${lines} lines)`) +
                "\n");
            break;
        }
        case "sync_prd_progress": {
            console.log("  " +
                chalk.green("╰─ ✓ Progress synchronized to KODA PRD Cloud") +
                "\n");
            break;
        }
        default: {
            const firstLine = output.trim().split("\n")[0] || "Done";
            console.log("  " +
                chalk.green("╰─ ✓ Done: ") +
                chalk.dim(firstLine.slice(0, 80)) +
                "\n");
        }
    }
}
export async function askUserPrompt(message = "❯") {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        const promptStr = chalk.bold.hex("#D97757")("koda ") +
            chalk.bold.hex("#408175")(message) +
            " ";
        rl.question(promptStr, (answer) => {
            rl.close();
            resolve(answer);
        });
        rl.on("SIGINT", () => {
            rl.close();
            console.log("");
            resolve("/exit");
        });
    });
}
export async function askConfirmation(message, defaultVal = true) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        const hint = defaultVal ? "(Y/n)" : "(y/N)";
        rl.question(`  ${chalk.yellow("⚠️ ")} ${chalk.bold.white(message)} ${chalk.dim(hint)} `, (ans) => {
            rl.close();
            const trimmed = ans.trim().toLowerCase();
            if (!trimmed)
                resolve(defaultVal);
            else
                resolve(trimmed === "y" || trimmed === "yes");
        });
        rl.on("SIGINT", () => {
            rl.close();
            resolve(false);
        });
    });
}
export async function askSelection(message, choices) {
    return await inquirerSelect({
        message: chalk.bold.white(message),
        choices,
    });
}
