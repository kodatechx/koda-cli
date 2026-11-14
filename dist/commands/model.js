import chalk from "chalk";
import { getGlobalConfig, setGlobalConfig } from "../services/config.js";
import { askSelection, askUserPrompt } from "../ui/terminal.js";
export async function modelCommand(providerArg, apiKeyArg) {
    const config = await getGlobalConfig();
    if (providerArg && apiKeyArg) {
        await setGlobalConfig("activeProvider", providerArg.toLowerCase());
        await setGlobalConfig("apiKey", apiKeyArg);
        console.log(chalk.green(`✓ Active provider updated to ${providerArg}`));
        return;
    }
    const currentProvider = config.activeProvider || "gemini";
    console.log(chalk.bold.hex("#408175")("\n🤖 KODA AI Model Provider Configuration"));
    console.log(`Current Provider: ${chalk.bold.white(currentProvider.toUpperCase())}`);
    const choice = await askSelection("Pilih AI Provider untuk KODA CLI:", [
        { name: "Google Gemini (Default - High Speed Flash Lite)", value: "gemini" },
        { name: "DeepSeek (deepseek-chat / reasoner)", value: "deepseek" },
        { name: "Groq (Ultra-Fast Llama 3.3)", value: "groq" },
        { name: "OpenAI (GPT-4o / GPT-4o-mini)", value: "openai" },
        { name: "Custom OpenAI-Compatible", value: "custom" },
    ]);
    if (choice === "gemini") {
        await setGlobalConfig("activeProvider", "gemini");
        const currentKey = config.geminiApiKey || process.env.GEMINI_API_KEY || "";
        const masked = currentKey ? currentKey.slice(0, 6) + "..." + currentKey.slice(-4) : "None";
        console.log(chalk.dim(`Current Gemini Key: ${masked}`));
        const newKey = await askUserPrompt("Enter Gemini API Key (leave empty to keep current): ");
        if (newKey.trim()) {
            await setGlobalConfig("geminiApiKey", newKey.trim());
        }
        console.log(chalk.green("✓ Configured to use Google Gemini with automatic model waterfall."));
    }
    else {
        await setGlobalConfig("activeProvider", choice);
        const key = await askUserPrompt(`Enter ${choice.toUpperCase()} API Key: `);
        if (key.trim()) {
            await setGlobalConfig("apiKey", key.trim());
        }
        if (choice === "custom") {
            const endpoint = await askUserPrompt("Enter API Base URL (e.g. http://localhost:11434/v1): ");
            if (endpoint.trim())
                await setGlobalConfig("endpointUrl", endpoint.trim());
            const model = await askUserPrompt("Enter Model Name (e.g. llama3.2): ");
            if (model.trim())
                await setGlobalConfig("modelName", model.trim());
        }
        console.log(chalk.green(`✓ Configured to use ${choice.toUpperCase()}.`));
    }
}
