import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { PrdDocumentData } from "../types/index.js";

let clientInstance: SupabaseClient | null = null;

const DEFAULT_SUPABASE_URL = "https://oliuwkxckwkcqyfpcnxj.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9saXV3a3hja3drY3F5ZnBjbnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMzA1OTUsImV4cCI6MjEwODgwNjU5NX0.vZSnSrgqUDlWvR8ppVcork0ex04GW3IeX5fSLJDsMyk";

export function getSupabaseClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  clientInstance = createClient(url, key);
  return clientInstance;
}

export async function fetchPrdDocument(idOrUrl: string): Promise<PrdDocumentData | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

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
  } catch {
    return null;
  }
}

export async function listRecentPrdDocuments(): Promise<Array<{ id: string; title: string; updatedAt: string }>> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("apps")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false })
      .limit(10);

    if (error || !data) return [];
    return data.map((d) => ({
      id: d.id,
      title: d.title || "Untitled PRD",
      updatedAt: d.updated_at,
    }));
  } catch {
    return [];
  }
}

export async function postPrdSyncComment(
  docId: string,
  commentText: string,
  authorName = "KODA Coding Agent"
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { data, error } = await supabase
      .from("apps")
      .select("*")
      .eq("id", docId)
      .maybeSingle();

    if (error || !data) return false;

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
  } catch {
    return false;
  }
}
