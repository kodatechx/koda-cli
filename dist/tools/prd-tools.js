import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { fetchPrdDocument, postPrdSyncComment } from "../services/koda-bridge.js";
export const fetchPrdSpecTool = {
    name: "fetch_prd_spec",
    description: "Fetch the linked KODA Product Requirements Document (PRD) specifications, architecture, and user stories.",
    parameters: {
        type: "object",
        properties: {
            PrdId: {
                type: "string",
                description: "Optional PRD Document ID. If omitted, uses the linked PRD in .koda/project.json.",
            },
        },
    },
    execute: async (args, context) => {
        let prdId = args.PrdId || context.projectConfig?.prdId;
        // Check local .koda/specs.md first
        const localSpecsPath = path.resolve(context.cwd, ".koda/specs.md");
        if (!prdId && fsSync.existsSync(localSpecsPath)) {
            try {
                const content = await fs.readFile(localSpecsPath, "utf-8");
                return {
                    success: true,
                    output: `Linked Local PRD Specs (.koda/specs.md):\n\n${content}`,
                };
            }
            catch { }
        }
        if (!prdId) {
            return {
                success: false,
                output: "No PRD linked to this project. Run 'koda link <prd-id>' first or pass PrdId to this tool.",
            };
        }
        const prd = await fetchPrdDocument(prdId);
        if (!prd) {
            // Fallback to local specs if available
            if (fsSync.existsSync(localSpecsPath)) {
                const content = await fs.readFile(localSpecsPath, "utf-8");
                return {
                    success: true,
                    output: `(Offline fallback) PRD Specs from .koda/specs.md:\n\n${content}`,
                };
            }
            return {
                success: false,
                output: `Could not fetch PRD with ID: ${prdId}. Please check database connection or PRD ID.`,
            };
        }
        const output = `### PRD: ${prd.title} (ID: ${prd.id})
Updated: ${prd.updatedAt || prd.createdAt || "Recently"}

${prd.markdownContent || prd.documentHtml.replace(/<[^>]+>/g, " ")}
`;
        return {
            success: true,
            output,
        };
    },
};
export const syncPrdProgressTool = {
    name: "sync_prd_progress",
    description: "Push an implementation progress report or question to the KODA Web PRD Editor comments so teammates can see it in real-time.",
    parameters: {
        type: "object",
        properties: {
            Message: {
                type: "string",
                description: "Progress message, completed task description, or review note to send to the PRD.",
            },
        },
        required: ["Message"],
    },
    execute: async (args, context) => {
        const prdId = context.projectConfig?.prdId;
        if (!prdId) {
            return {
                success: false,
                output: "No PRD is linked to this workspace. Please run 'koda link' first.",
            };
        }
        const ok = await postPrdSyncComment(prdId, args.Message, "KODA Coding Agent (CLI)");
        if (ok) {
            return {
                success: true,
                output: `Successfully synced progress to PRD '${context.projectConfig?.title || prdId}' on KODA Web!`,
            };
        }
        else {
            return {
                success: false,
                output: "Failed to post comment to PRD. Check Supabase connection or permissions.",
            };
        }
    },
};
