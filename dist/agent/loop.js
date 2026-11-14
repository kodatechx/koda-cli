import chalk from "chalk";
import ora from "ora";
import { callLlm } from "../services/llm.js";
import { buildSystemInstruction } from "./prompt.js";
import { getToolByName } from "../tools/index.js";
import { printToolStart, printToolDone, askConfirmation, formatTerminalMarkdown } from "../ui/terminal.js";
export async function runAgentLoop(userPrompt, context, history = [], maxSteps = 15) {
    const systemInstruction = buildSystemInstruction(context);
    history.push({
        role: "user",
        parts: [{ text: userPrompt }],
    });
    let step = 0;
    let finalReply = "";
    while (step < maxSteps) {
        step++;
        const spinner = ora({
            text: chalk.dim("KODA thinking..."),
            color: "cyan",
        }).start();
        try {
            const response = await callLlm(history, systemInstruction);
            spinner.stop();
            // If the model produced explanatory text
            if (response.text) {
                console.log("\n" + formatTerminalMarkdown(response.text) + "\n");
                finalReply = response.text;
            }
            // If no function calls, the agent has finished this conversational turn
            if (!response.functionCalls || response.functionCalls.length === 0) {
                if (response.text) {
                    history.push({
                        role: "model",
                        parts: [{ text: response.text }],
                    });
                }
                break;
            }
            // Append model turn preserving thoughtSignature, id, and tool calls exactly
            if (response.rawParts && response.rawParts.length > 0) {
                history.push({
                    role: "model",
                    parts: response.rawParts,
                });
            }
            else {
                history.push({
                    role: "model",
                    parts: response.functionCalls.map((fc) => ({
                        functionCall: {
                            name: fc.name,
                            args: fc.args,
                            id: fc.id,
                        },
                    })),
                });
            }
            // Execute each tool and collect responses in a single user turn
            const toolResponseParts = [];
            for (const fc of response.functionCalls) {
                const tool = getToolByName(fc.name);
                printToolStart(fc.name, fc.args);
                let toolOutput = "";
                let isSuccess = false;
                if (!tool) {
                    toolOutput = `Error: Tool '${fc.name}' does not exist.`;
                    printToolDone(fc.name, false, toolOutput, fc.args);
                }
                else {
                    // If tool is run_command, confirm if in interactive mode or destructive
                    if (fc.name === "run_command" && (fc.args.CommandLine?.includes("rm ") || fc.args.CommandLine?.includes("mkfs"))) {
                        const confirmed = await askConfirmation(`Allow agent to run: '${fc.args.CommandLine}'?`);
                        if (!confirmed) {
                            toolOutput = "User denied permission to execute command.";
                            printToolDone(fc.name, false, toolOutput, fc.args);
                            toolResponseParts.push({
                                functionResponse: {
                                    name: fc.name,
                                    response: { output: toolOutput },
                                    id: fc.id,
                                },
                            });
                            continue;
                        }
                    }
                    const res = await tool.execute(fc.args, context);
                    toolOutput = res.output;
                    isSuccess = res.success;
                    printToolDone(fc.name, isSuccess, res.output, fc.args);
                }
                toolResponseParts.push({
                    functionResponse: {
                        name: fc.name,
                        response: { output: toolOutput },
                        id: fc.id,
                    },
                });
            }
            // Push all tool responses as one user turn matching the model's function calls
            history.push({
                role: "user",
                parts: toolResponseParts,
            });
        }
        catch (err) {
            spinner.stop();
            console.error(chalk.red(`\n[Agent Error]: ${err.message}`));
            finalReply = `Error: ${err.message}`;
            break;
        }
    }
    return { reply: finalReply, history };
}
