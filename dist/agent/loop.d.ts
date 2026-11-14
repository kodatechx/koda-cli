import { AgentContext } from "../types/index.js";
import { LlmMessage } from "../services/llm.js";
export declare function runAgentLoop(userPrompt: string, context: AgentContext, history?: LlmMessage[], maxSteps?: number): Promise<{
    reply: string;
    history: LlmMessage[];
}>;
