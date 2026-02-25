import { NextRequest, NextResponse } from "next/server";
import { triggerN8n } from "@/lib/n8n";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audio, audioFormat, history } = body;

    if (!audio) {
      return NextResponse.json({ error: "Audio required" }, { status: 400 });
    }

    // n8n workflow handles: audio → Sarvam AI STT → LLM → Sarvam AI TTS → response
    const data = await triggerN8n<Record<string, string>>(
      "voice",
      {
        audio,
        audioFormat: audioFormat || "audio/webm",
        history: (history || []).slice(-10),
        mode: "voice",
      },
      { timeout: 45000 } // Voice needs more time
    );

    return NextResponse.json({
      message: data?.message || data?.response || "Voice message received.",
      audio: data?.audio || null, // Base64 audio response from Sarvam TTS
      audioFormat: data?.audioFormat || "audio/mp3",
    });
  } catch (error) {
    console.error("Voice pipeline error:", error);
    return NextResponse.json({
      message: "Voice message sent to our team.",
      audio: null,
    });
  }
}
