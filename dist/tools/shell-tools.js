import { exec } from "child_process";
const FORBIDDEN_COMMANDS = [
    "rm -rf /",
    "rm -rf /*",
    ":(){ :|:& };:",
    "mkfs",
    "dd if=/dev/zero",
];
export const runCommandTool = {
    name: "run_command",
    description: "Execute a bash shell command in the local workspace directory (e.g. running tests, build, git, installing packages).",
    parameters: {
        type: "object",
        properties: {
            CommandLine: {
                type: "string",
                description: "The shell command to execute.",
            },
            TimeoutMs: {
                type: "number",
                description: "Optional timeout in milliseconds (default: 60000ms).",
            },
        },
        required: ["CommandLine"],
    },
    execute: async (args, context) => {
        const cmd = args.CommandLine.trim();
        for (const forbidden of FORBIDDEN_COMMANDS) {
            if (cmd.includes(forbidden)) {
                return {
                    success: false,
                    output: `Command blocked for security reasons: ${forbidden}`,
                };
            }
        }
        const timeout = args.TimeoutMs || 60000;
        return new Promise((resolve) => {
            exec(cmd, {
                cwd: context.cwd,
                timeout,
                maxBuffer: 10 * 1024 * 1024,
                env: {
                    ...process.env,
                    PAGER: "cat",
                },
            }, (error, stdout, stderr) => {
                let output = "";
                if (stdout)
                    output += stdout;
                if (stderr)
                    output += (output ? "\n[stderr]\n" : "") + stderr;
                if (error) {
                    const exitCode = error.code !== undefined ? error.code : 1;
                    resolve({
                        success: false,
                        output: output || error.message,
                        error: `Command exited with code ${exitCode}`,
                    });
                }
                else {
                    resolve({
                        success: true,
                        output: output || "(Command completed with no output)",
                    });
                }
            });
        });
    },
};
