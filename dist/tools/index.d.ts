import { ToolDefinition } from "../types/index.js";
export declare const allTools: ToolDefinition[];
export declare function getToolByName(name: string): ToolDefinition | undefined;
export declare function getGeminiToolDeclarations(): {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: Record<string, any>;
        required: string[];
    };
}[];
