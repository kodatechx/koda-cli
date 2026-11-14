import { SupabaseClient } from "@supabase/supabase-js";
import { PrdDocumentData } from "../types/index.js";
export declare function getSupabaseClient(): SupabaseClient | null;
export declare function fetchPrdDocument(idOrUrl: string): Promise<PrdDocumentData | null>;
export declare function listRecentPrdDocuments(): Promise<Array<{
    id: string;
    title: string;
    updatedAt: string;
}>>;
export declare function postPrdSyncComment(docId: string, commentText: string, authorName?: string): Promise<boolean>;
