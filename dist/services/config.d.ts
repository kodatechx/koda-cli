import { KodaProjectConfig } from "../types/index.js";
export declare function loadEnvironment(cwd: string): void;
export declare function getProjectConfigPath(cwd: string): string;
export declare function readProjectConfig(cwd: string): Promise<KodaProjectConfig | null>;
export declare function saveProjectConfig(cwd: string, config: KodaProjectConfig): Promise<void>;
export declare function getGlobalConfigPath(): string;
export declare function getGlobalConfig(): Promise<Record<string, any>>;
export declare function setGlobalConfig(key: string, value: any): Promise<void>;
