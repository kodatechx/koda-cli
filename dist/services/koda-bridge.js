import { createClient } from "@supabase/supabase-js";
let clientInstance = null;
export function getSupabaseClient() {
    if (clientInstance)
        return clientInstance;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
        return null;
    }
    clientInstance = createClient(url, key);
    return clientInstance;
}
export async function fetchPrdDocument(idOrUrl) {
    const supabase = getSupabaseClient();
    if (!supabase)
        return null;
    // Extract ID if URL is passed (e.g. https://kodaaistudio.vercel.app/tools/prd-editor/doc-xxx)
    let docId = idOrUrl.trim();
    const match = docId.match(/\/prd-editor\/([a-zA-Z0-9_-]+)/);
    if (match) {
        docId = match[1];
    }
    try {
        const { data, error } = await supabase
            .from("apps")
            .select("*")
            .eq("id", docId)
            .maybeSingle();
        if (error || !data) {
            return null;
        }
        const docMsg = data.messages?.[0] || {};
        return {
            id: data.id,
            title: data.title || "KODA PRD Document",
            documentHtml: docMsg.html || "",
            markdownContent: docMsg.content || "",
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }
    catch {
        return null;
    }
}
export async function listRecentPrdDocuments() {
    const supabase = getSupabaseClient();
    if (!supabase)
        return [];
    try {
        const { data, error } = await supabase
            .from("apps")
            .select("id, title, updated_at")
            .order("updated_at", { ascending: false })
            .limit(10);
        if (error || !data)
            return [];
        return data.map((d) => ({
            id: d.id,
            title: d.title || "Untitled PRD",
            updatedAt: d.updated_at,
        }));
    }
    catch {
        return [];
    }
}
export async function postPrdSyncComment(docId, commentText, authorName = "KODA Coding Agent") {
    const supabase = getSupabaseClient();
    if (!supabase)
        return false;
    try {
        const { data, error } = await supabase
            .from("apps")
            .select("*")
            .eq("id", docId)
            .maybeSingle();
        if (error || !data)
            return false;
        const messages = data.messages || [{}];
        const docMsg = messages[0] || {};
        const existingComments = docMsg.comments || [];
        const newComment = {
            id: `comment-agent-${Date.now()}`,
            author: authorName,
            authorRole: "AI Coding Agent",
            initial: "KD",
            authorColor: "#408175",
            text: commentText,
            tag: "Agent Sync",
            sectionName: "Implementasi CLI",
            createdAt: new Date().toISOString(),
            resolved: false,
            replies: [],
        };
        docMsg.comments = [...existingComments, newComment];
        messages[0] = docMsg;
        const { error: updateError } = await supabase
            .from("apps")
            .update({
            messages,
            updated_at: new Date().toISOString(),
        })
            .eq("id", docId);
        return !updateError;
    }
    catch {
        return false;
    }
}
