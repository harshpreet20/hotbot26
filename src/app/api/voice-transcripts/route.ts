import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function sbAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  const { user_message, ai_reply, language, session_id } = await req.json() as {
    user_message?: string;
    ai_reply?: string;
    language?: string;
    session_id?: string;
  };

  const supabase = sbAdmin();

  if (supabase) {
    // Store transcript in voice_transcripts table
    const { error: transcriptError } = await supabase
      .from("voice_transcripts")
      .insert({
        user_message,
        ai_reply,
        language: language || "en",
        session_id: session_id || crypto.randomUUID(),
        created_at: new Date().toISOString(),
      });

    if (transcriptError) {
      // Table may not exist yet — log but don't block
      console.error("[voice-transcripts] storage error:", transcriptError.message);
    }

    // Also feed substantial Q&A into knowledge_base for self-improvement
    if (user_message && ai_reply && ai_reply.length > 50) {
      try {
        await supabase
          .from("knowledge_base")
          .insert({
            title: `Voice Q: ${user_message.slice(0, 80)}`,
            content: `Q: ${user_message}\n\nA: ${ai_reply}`,
            category: "voice-transcript",
            source: "sarvam-voice",
            created_at: new Date().toISOString(),
          });
      } catch {
        // silently ignore if table doesn't exist or schema differs
      }
    }
  }

  return NextResponse.json({ ok: true });
}
