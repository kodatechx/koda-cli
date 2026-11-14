export interface ToolParameterProperty {
  type: string;
  description: string;
  enum?: string[];
}

export interface ToolParameterSchema {
  type: "object";
  properties: Record<string, ToolParameterProperty>;
  required?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameterSchema;
  execute: (args: any, context: AgentContext) => Promise<ToolResult>;
}

export interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
  modifiedFiles?: string[];
}

export interface AgentContext {
  cwd: string;
  projectConfig?: KodaProjectConfig | null;
  verbose?: boolean;
}

export interface KodaProjectConfig {
  prdId: string;
  title: string;
  version: string;
  linkedAt: string;
  lastSyncedAt?: string;
  tasks?: Array<{
    id: string;
    title: string;
    description?: string;
    completed: boolean;
  }>;
}

export interface PrdDocumentData {
  id: string;
  title: string;
  documentHtml: string;
  markdownContent?: string;
  createdAt?: string;
  updatedAt?: string;
  tasks?: Array<{ id: string; title: string; completed: boolean }>;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system" | "tool";
  content?: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    args: Record<string, any>;
  }>;
  toolCallId?: string;
}
