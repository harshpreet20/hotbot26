import { NextRequest, NextResponse } from "next/server";

const SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text";

export async function POST(req: NextRequest) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Sarvam not configured" }, { status: 503 });

  try {
    const body = await req.formData();
    const audio = body.get("audio") as Blob | null;
    if (!audio) return NextResponse.json({ error: "No audio" }, { status: 400 });

    const form = new FormData();
    form.append("file", audio, "recording.webm");
    form.append("model", "saaras:v3");
    form.append("language_code", "unknown"); // auto-detect Hindi, English, mixed
    form.append("mode", "transcribe");

    const res = await fetch(SARVAM_STT_URL, {
      method: "POST",
      headers: { "api-subscription-key": apiKey },
      body: form,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[sarvam/stt] error:", res.status, err);
      return NextResponse.json({ error: "STT failed" }, { status: res.status });
    }

    const data = await res.json() as { transcript: string; language_code?: string };
    return NextResponse.json({ transcript: data.transcript, language: data.language_code });
  } catch (e) {
    console.error("[sarvam/stt]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
