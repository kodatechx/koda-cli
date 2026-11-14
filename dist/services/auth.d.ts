export interface AuthSession {
    token?: string;
    email: string;
    name: string;
    avatarUrl?: string;
    tier?: string;
    loggedInAt: string;
}
export declare function getAuthFilePath(): string;
export declare function getAuthSession(): Promise<AuthSession | null>;
export declare function saveAuthSession(session: AuthSession): Promise<void>;
export declare function clearAuthSession(): Promise<void>;
export declare function isAuthenticated(): Promise<boolean>;
