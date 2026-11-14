import { ToolDefinition } from "../types/index.js";
import { viewFileTool, writeToFileTool, replaceFileContentTool, listDirTool } from "./file-tools.js";
import { findByNameTool, grepSearchTool } from "./search-tools.js";
import { runCommandTool } from "./shell-tools.js";
import { fetchPrdSpecTool, syncPrdProgressTool } from "./prd-tools.js";

export const allTools: ToolDefinition[] = [
  viewFileTool,
  writeToFileTool,
  replaceFileContentTool,
  listDirTool,
  findByNameTool,
  grepSearchTool,
  runCommandTool,
  fetchPrdSpecTool,
  syncPrdProgressTool,
];

export function getToolByName(name: string): ToolDefinition | undefined {
  return allTools.find((t) => t.name === name);
}

// Convert tools to Gemini Function Declarations schema
export function getGeminiToolDeclarations() {
  return allTools.map((t) => {
    const props: Record<string, any> = {};
    for (const [key, val] of Object.entries(t.parameters.properties)) {
      props[key] = {
        type: val.type.toUpperCase(),
        description: val.description,
      };
      if (val.enum) {
        props[key].enum = val.enum;
      }
    }

    return {
      name: t.name,
      description: t.description,
      parameters: {
        type: "OBJECT",
        properties: props,
        required: t.parameters.required || [],
      },
    };
  });
}
