import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import * as diff from "diff";
import chalk from "chalk";
function resolvePath(target, cwd) {
    if (path.isAbsolute(target))
        return target;
    return path.resolve(cwd, target);
}
export function formatDiff(filename, oldStr, newStr) {
    const patch = diff.createPatch(filename, oldStr, newStr);
    const lines = patch.split("\n");
    const colored = lines
        .map((line) => {
        if (line.startsWith("+") && !line.startsWith("+++")) {
            return chalk.green(line);
        }
        else if (line.startsWith("-") && !line.startsWith("---")) {
            return chalk.red(line);
        }
        else if (line.startsWith("@")) {
            return chalk.cyan(line);
        }
        return chalk.dim(line);
    })
        .join("\n");
    return colored;
}
export const viewFileTool = {
    name: "view_file",
    description: "View the contents of a file with line numbers. Optionally specify StartLine and EndLine (1-indexed).",
    parameters: {
        type: "object",
        properties: {
            FilePath: {
                type: "string",
                description: "Path to file to view. Can be relative to current directory or absolute.",
            },
            StartLine: {
                type: "number",
                description: "Optional 1-indexed start line number.",
            },
            EndLine: {
                type: "number",
                description: "Optional 1-indexed end line number.",
            },
        },
        required: ["FilePath"],
    },
    execute: async (args, context) => {
        try {
            const fullPath = resolvePath(args.FilePath, context.cwd);
            if (!fsSync.existsSync(fullPath)) {
                return { success: false, output: `File not found: ${args.FilePath}` };
            }
            const stat = await fs.stat(fullPath);
            if (stat.isDirectory()) {
                return { success: false, output: `${args.FilePath} is a directory, not a file. Use list_dir instead.` };
            }
            const content = await fs.readFile(fullPath, "utf-8");
            const lines = content.split("\n");
            const totalLines = lines.length;
            const start = args.StartLine ? Math.max(1, Math.min(args.StartLine, totalLines)) : 1;
            const end = args.EndLine ? Math.max(start, Math.min(args.EndLine, totalLines)) : Math.min(start + 500, totalLines);
            const outputLines = [];
            outputLines.push(`Showing lines ${start} to ${end} of ${totalLines} in ${path.relative(context.cwd, fullPath)}:`);
            for (let i = start; i <= end; i++) {
                const lineNum = String(i).padStart(4, " ");
                outputLines.push(`${lineNum} | ${lines[i - 1]}`);
            }
            return {
                success: true,
                output: outputLines.join("\n"),
            };
        }
        catch (err) {
            return { success: false, output: `Error viewing file: ${err.message}` };
        }
    },
};
export const writeToFileTool = {
    name: "write_to_file",
    description: "Create a new file or completely overwrite an existing file with the provided code content.",
    parameters: {
        type: "object",
        properties: {
            TargetFile: {
                type: "string",
                description: "Path to file to write.",
            },
            Content: {
                type: "string",
                description: "Full content of the file.",
            },
            Description: {
                type: "string",
                description: "Brief summary of what this file contains or why it is being created.",
            },
        },
        required: ["TargetFile", "Content"],
    },
    execute: async (args, context) => {
        try {
            const fullPath = resolvePath(args.TargetFile, context.cwd);
            const dir = path.dirname(fullPath);
            await fs.mkdir(dir, { recursive: true });
            const oldContent = fsSync.existsSync(fullPath) ? await fs.readFile(fullPath, "utf-8") : "";
            await fs.writeFile(fullPath, args.Content, "utf-8");
            const diffPreview = formatDiff(path.basename(fullPath), oldContent, args.Content);
            return {
                success: true,
                output: `Successfully wrote file: ${path.relative(context.cwd, fullPath)}\n\n${diffPreview}`,
                modifiedFiles: [fullPath],
            };
        }
        catch (err) {
            return { success: false, output: `Error writing file: ${err.message}` };
        }
    },
};
export const replaceFileContentTool = {
    name: "replace_file_content",
    description: "Replaces a specific block of text in an existing file with new content.",
    parameters: {
        type: "object",
        properties: {
            TargetFile: {
                type: "string",
                description: "Path to file to edit.",
            },
            TargetContent: {
                type: "string",
                description: "Exact existing block of text to be replaced (must match exactly including indentation).",
            },
            ReplacementContent: {
                type: "string",
                description: "The replacement content.",
            },
        },
        required: ["TargetFile", "TargetContent", "ReplacementContent"],
    },
    execute: async (args, context) => {
        try {
            const fullPath = resolvePath(args.TargetFile, context.cwd);
            if (!fsSync.existsSync(fullPath)) {
                return { success: false, output: `File not found: ${args.TargetFile}` };
            }
            const original = await fs.readFile(fullPath, "utf-8");
            if (!original.includes(args.TargetContent)) {
                return {
                    success: false,
                    output: `TargetContent was not found in ${args.TargetFile}. Please make sure whitespace and indentation match the file exactly.`,
                };
            }
            const occurrences = original.split(args.TargetContent).length - 1;
            if (occurrences > 1) {
                return {
                    success: false,
                    output: `TargetContent occurs ${occurrences} times in ${args.TargetFile}. Please provide more surrounding lines to make the replacement unique.`,
                };
            }
            const updated = original.replace(args.TargetContent, args.ReplacementContent);
            await fs.writeFile(fullPath, updated, "utf-8");
            const diffPreview = formatDiff(path.basename(fullPath), original, updated);
            return {
                success: true,
                output: `Successfully updated ${path.relative(context.cwd, fullPath)}:\n\n${diffPreview}`,
                modifiedFiles: [fullPath],
            };
        }
        catch (err) {
            return { success: false, output: `Error editing file: ${err.message}` };
        }
    },
};
export const listDirTool = {
    name: "list_dir",
    description: "List files and subdirectories within a directory.",
    parameters: {
        type: "object",
        properties: {
            DirectoryPath: {
                type: "string",
                description: "Path to directory to list. Defaults to current directory ('.').",
            },
        },
    },
    execute: async (args, context) => {
        try {
            const dirPath = resolvePath(args.DirectoryPath || ".", context.cwd);
            if (!fsSync.existsSync(dirPath)) {
                return { success: false, output: `Directory not found: ${args.DirectoryPath || "."}` };
            }
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            const items = entries
                .filter((e) => !e.name.startsWith(".git") && e.name !== "node_modules")
                .map((e) => {
                const type = e.isDirectory() ? "[DIR] " : "      ";
                return `${type} ${e.name}`;
            });
            return {
                success: true,
                output: `Contents of ${path.relative(context.cwd, dirPath) || "."}:\n` + items.join("\n"),
            };
        }
        catch (err) {
            return { success: false, output: `Error listing directory: ${err.message}` };
        }
    },
};
