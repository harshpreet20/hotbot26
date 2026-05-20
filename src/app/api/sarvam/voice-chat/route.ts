import { NextRequest, NextResponse } from "next/server";

const STT_URL = "https://api.sarvam.ai/speech-to-text";
const LLM_URL = "https://api.sarvam.ai/v1/chat/completions";
const TTS_URL = "https://api.sarvam.ai/text-to-speech";

const SYSTEM_PROMPT = `You are HotBot, the AI voice assistant for HotBot Studios — a digital marketing and AI automation agency. This is a real-time voice conversation so keep ALL replies to 1–2 short sentences maximum. Be warm, friendly, and action-oriented. Services include: AI Automation, AI Chatbots, Voice AI, SEO, PPC, Social Media, UI/UX, Software Development. To proceed, suggest booking a call or WhatsApp (+91 97000 01534).`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Sarvam not configured" }, { status: 503 });

  try {
    const body = await req.formData();
    const audio = body.get("audio") as Blob | null;
    const historyRaw = body.get("history") as string | null;
    const history = historyRaw
      ? (JSON.parse(historyRaw) as { role: string; content: string }[])
      : [];

    if (!audio) return NextResponse.json({ error: "No audio" }, { status: 400 });

    // ── 1. STT ────────────────────────────────────────────────────────────────
    const sttForm = new FormData();
    sttForm.append("file", audio, "recording.webm");
    sttForm.append("model", "saaras:v3");
    sttForm.append("language_code", "unknown");
    sttForm.append("mode", "transcribe");

    const sttRes = await fetch(STT_URL, {
      method: "POST",
      headers: { "api-subscription-key": apiKey },
      body: sttForm,
    });
    if (!sttRes.ok) {
      const err = await sttRes.text();
      console.error("[voice-chat] STT error:", sttRes.status, err);
      return NextResponse.json({ error: "STT failed" }, { status: sttRes.status });
    }
    const sttData = await sttRes.json() as { transcript: string; language_code?: string };
    const transcript = sttData.transcript?.trim();
    if (!transcript) return NextResponse.json({ error: "No speech detected" }, { status: 400 });

    // ── 2. Sarvam LLM ─────────────────────────────────────────────────────────
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-6),
      { role: "user", content: transcript },
    ];

    const llmRes = await fetch(LLM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        model: "sarvam-30b",
        messages,
        max_tokens: 120,
        temperature: 0.7,
      }),
    });
    if (!llmRes.ok) {
      const err = await llmRes.text();
      console.error("[voice-chat] LLM error:", llmRes.status, err);
      return NextResponse.json({ error: "LLM failed" }, { status: llmRes.status });
    }
    const llmData = await llmRes.json() as { choices: { message: { content: string } }[] };
    const reply =
      llmData.choices[0]?.message?.content?.trim() ||
      "I didn't catch that. Could you repeat?";

    // ── 3. TTS ────────────────────────────────────────────────────────────────
    const ttsRes = await fetch(TTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        inputs: [reply.slice(0, 500)],
        target_language_code: "en-IN",
        speaker: "priya",
        model: "bulbul:v3",
        speech_sample_rate: 22050,
        pace: 1.0,
        loudness: 1.5,
        enable_preprocessing: true,
      }),
    });

    let audiob64: string | undefined;
    if (ttsRes.ok) {
      const ttsData = await ttsRes.json() as { audios: string[] };
      audiob64 = ttsData.audios?.[0];
    } else {
      console.error("[voice-chat] TTS error:", ttsRes.status);
    }

    return NextResponse.json({
      transcript,
      reply,
      audio: audiob64,
      language: sttData.language_code,
    });
  } catch (e) {
    console.error("[voice-chat]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
