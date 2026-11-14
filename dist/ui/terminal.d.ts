import { KodaProjectConfig } from "../types/index.js";
import { AuthSession } from "../services/auth.js";
export declare function terminalHyperlink(text: string, url: string): string;
export declare function printKodaLogoArt(): void;
export declare function printBanner(config?: KodaProjectConfig | null, auth?: AuthSession | null): void;
export declare function printAuthScreen(loginUrl: string): void;
export declare function formatTerminalMarkdown(text: string): string;
export declare function printToolStart(name: string, args: Record<string, any>): void;
export declare function printToolDone(name: string, success: boolean, output: string, args?: Record<string, any>): void;
export declare function askUserPrompt(message?: string): Promise<string>;
export declare function askConfirmation(message: string, defaultVal?: boolean): Promise<boolean>;
export declare function askSelection<T>(message: string, choices: Array<{
    name: string;
    value: T;
}>): Promise<T>;
