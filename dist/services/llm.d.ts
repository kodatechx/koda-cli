export interface LlmMessagePart {
    text?: string;
    thoughtSignature?: string;
    functionCall?: {
        name: string;
        args: Record<string, any>;
        id?: string;
    };
    functionResponse?: {
        name: string;
        response: Record<string, any>;
        id?: string;
    };
    [key: string]: any;
}
export interface LlmMessage {
    role: "user" | "model";
    parts: LlmMessagePart[];
}
export interface LlmResponse {
    text: string;
    rawParts?: any[];
    functionCalls?: Array<{
        id?: string;
        name: string;
        args: Record<string, any>;
    }>;
}
export declare function callLlm(messages: LlmMessage[], systemInstruction?: string, modelOverride?: string): Promise<LlmResponse>;
