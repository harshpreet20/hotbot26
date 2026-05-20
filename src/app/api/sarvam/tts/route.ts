import { NextRequest, NextResponse } from "next/server";

const SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech";

export async function POST(req: NextRequest) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Sarvam not configured" }, { status: 503 });

  try {
    const { text } = await req.json() as { text: string };
    if (!text?.trim()) return NextResponse.json({ error: "No text" }, { status: 400 });

    // Truncate to ~500 chars (Sarvam TTS limit per call)
    const trimmed = text.trim().slice(0, 500);

    const res = await fetch(SARVAM_TTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        inputs: [trimmed],
        target_language_code: "en-IN",
        speaker: "priya",         // warm, friendly female — best for chatbot
        model: "bulbul:v3",
        speech_sample_rate: 22050,
        pace: 1.0,
        loudness: 1.5,
        enable_preprocessing: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[sarvam/tts] error:", res.status, err);
      return NextResponse.json({ error: "TTS failed" }, { status: res.status });
    }

    const data = await res.json() as { audios: string[] };
    const audioB64 = data.audios?.[0];
    if (!audioB64) return NextResponse.json({ error: "No audio returned" }, { status: 500 });

    return NextResponse.json({ audio: audioB64 }); // base64-encoded WAV
  } catch (e) {
    console.error("[sarvam/tts]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
