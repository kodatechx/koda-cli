import { GoogleGenAI } from "@google/genai";
import { getGeminiToolDeclarations } from "../tools/index.js";
import { getGlobalConfig } from "./config.js";
// Resilient Gemini models waterfall prioritizing high-quota Flash Lite models
const CANDIDATE_GEMINI_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-2.5-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
];
export async function callLlm(messages, systemInstruction, modelOverride) {
    const globalConfig = await getGlobalConfig();
    // 1. Check if user configured a custom OpenAI / DeepSeek / Groq provider
    const customProvider = globalConfig.activeProvider; // e.g. "deepseek", "openai", "groq", "ollama"
    const customKey = globalConfig.apiKey || process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.GROQ_API_KEY;
    if (customProvider && customProvider !== "gemini" && customKey) {
        const endpoint = globalConfig.endpointUrl ||
            (customProvider === "deepseek" ? "https://api.deepseek.com/v1" :
                customProvider === "groq" ? "https://api.groq.com/openai/v1" :
                    "https://api.openai.com/v1");
        const modelName = globalConfig.modelName ||
            (customProvider === "deepseek" ? "deepseek-chat" :
                customProvider === "groq" ? "llama-3.3-70b-versatile" :
                    "gpt-4o");
        const res = await fetch(`${endpoint}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${customKey}`,
            },
            body: JSON.stringify({
                model: modelName,
                messages: [
                    ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
                    ...messages.map((m) => ({
                        role: m.role === "model" ? "assistant" : "user",
                        content: m.parts.map((p) => p.text || "").join(" "),
                    })),
                ],
            }),
        });
        if (!res.ok) {
            throw new Error(`${customProvider} API error (${res.status}): ${await res.text()}`);
        }
        const data = await res.json();
        return {
            text: data.choices?.[0]?.message?.content || "",
        };
    }
    // 2. Default Google Gemini Provider
    const geminiApiKey = globalConfig.geminiApiKey || process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const modelsToTry = modelOverride
            ? [modelOverride, ...CANDIDATE_GEMINI_MODELS]
            : CANDIDATE_GEMINI_MODELS;
        let lastError = null;
        for (const modelName of modelsToTry) {
            try {
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: messages,
                    config: {
                        systemInstruction: systemInstruction || undefined,
                        tools: [{ functionDeclarations: getGeminiToolDeclarations() }],
                        temperature: 0.2,
                    },
                });
                const candidate = response.candidates?.[0];
                const rawParts = candidate?.content?.parts || [];
                // Safely extract text parts without triggering SDK warning
                const textParts = rawParts.filter((p) => typeof p.text === "string" && !p.functionCall);
                const replyText = textParts.map((p) => p.text).join("\n").trim();
                const calls = [];
                if (response.functionCalls && Array.isArray(response.functionCalls)) {
                    for (const fc of response.functionCalls) {
                        if (fc.name) {
                            calls.push({
                                name: fc.name,
                                args: fc.args || {},
                                id: fc.id,
                            });
                        }
                    }
                }
                return {
                    text: replyText,
                    rawParts,
                    functionCalls: calls.length > 0 ? calls : undefined,
                };
            }
            catch (err) {
                lastError = err;
                const msg = String(err?.message || err);
                // If client argument error (400), don't cascade as it's not a server quota issue
                if (msg.includes("400") || msg.includes("INVALID_ARGUMENT")) {
                    throw err;
                }
                // On 429 (rate limit) or 503 (high demand), cascade to next resilient model
                continue;
            }
        }
        throw new Error(`All candidate models failed. Last error: ${lastError?.message || lastError}`);
    }
    throw new Error("No API key found. Please set GEMINI_API_KEY in your environment, app/.env.local, or run 'koda model' to configure.");
}
