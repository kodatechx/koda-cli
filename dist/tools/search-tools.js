import fs from "fs/promises";
import path from "path";
async function walkDir(dir, baseDir, filterFn, results = []) {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist" || entry.name === ".next") {
                continue;
            }
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await walkDir(fullPath, baseDir, filterFn, results);
            }
            else if (entry.isFile()) {
                const rel = path.relative(baseDir, fullPath);
                if (filterFn(rel, entry)) {
                    results.push(rel);
                }
            }
        }
    }
    catch { }
    return results;
}
export const findByNameTool = {
    name: "find_by_name",
    description: "Search for files within the repository matching a name pattern or extension.",
    parameters: {
        type: "object",
        properties: {
            Pattern: {
                type: "string",
                description: "Substring or extension to search for in filenames (e.g., 'route.ts', 'editor', '.tsx').",
            },
            Directory: {
                type: "string",
                description: "Optional directory to search within (defaults to project root).",
            },
        },
        required: ["Pattern"],
    },
    execute: async (args, context) => {
        try {
            const searchDir = path.resolve(context.cwd, args.Directory || ".");
            const pattern = args.Pattern.toLowerCase();
            const matched = await walkDir(searchDir, context.cwd, (rel) => {
                return rel.toLowerCase().includes(pattern);
            });
            if (matched.length === 0) {
                return { success: true, output: `No files found matching '${args.Pattern}' in ${args.Directory || "."}` };
            }
            return {
                success: true,
                output: `Found ${matched.length} files matching '${args.Pattern}':\n` + matched.slice(0, 50).join("\n"),
            };
        }
        catch (err) {
            return { success: false, output: `Error finding files: ${err.message}` };
        }
    },
};
export const grepSearchTool = {
    name: "grep_search",
    description: "Search for text or regex pattern matches inside repository files.",
    parameters: {
        type: "object",
        properties: {
            Query: {
                type: "string",
                description: "The text string to look for.",
            },
            CaseInsensitive: {
                type: "boolean",
                description: "Whether search should be case-insensitive (default: true).",
            },
        },
        required: ["Query"],
    },
    execute: async (args, context) => {
        try {
            const isCaseInsensitive = args.CaseInsensitive !== false;
            const query = isCaseInsensitive ? args.Query.toLowerCase() : args.Query;
            const files = await walkDir(context.cwd, context.cwd, () => true);
            const matches = [];
            for (const relPath of files) {
                if (matches.length >= 60)
                    break;
                const fullPath = path.resolve(context.cwd, relPath);
                try {
                    const content = await fs.readFile(fullPath, "utf-8");
                    const lines = content.split("\n");
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        const testLine = isCaseInsensitive ? line.toLowerCase() : line;
                        if (testLine.includes(query)) {
                            matches.push({
                                file: relPath,
                                line: i + 1,
                                content: line.trim(),
                            });
                            if (matches.length >= 60)
                                break;
                        }
                    }
                }
                catch { }
            }
            if (matches.length === 0) {
                return { success: true, output: `No occurrences of '${args.Query}' found in repository.` };
            }
            const formatted = matches
                .map((m) => `${m.file}:${m.line}: ${m.content}`)
                .join("\n");
            return {
                success: true,
                output: `Found ${matches.length} matches for '${args.Query}':\n${formatted}`,
            };
        }
        catch (err) {
            return { success: false, output: `Error running grep: ${err.message}` };
        }
    },
};
