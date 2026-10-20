import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { autorizado } from "../auth";

// POST /api/audio?nombre=S014  — cuerpo: el MP3 de la voz tal cual (Content-Type audio/mpeg).
// Lo guarda en Vercel Blob y devuelve { url } para usarla como voz.src en /api/render,
// porque los enlaces de Google Drive no sirven como audio público para el render.
export async function POST(req: Request) {
  if (!autorizado(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const audio = await req.arrayBuffer();
  if (!audio.byteLength) return NextResponse.json({ error: "Falta el audio" }, { status: 400 });

  const nombre = (new URL(req.url).searchParams.get("nombre") ?? "voz").replace(/[^A-Za-z0-9-]+/g, "-");
  const { url } = await put(`voces/${nombre}-${Date.now()}.mp3`, Buffer.from(audio), {
    access: "public",
    contentType: "audio/mpeg",
  });

  return NextResponse.json({ url });
}
