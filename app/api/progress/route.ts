import { getRenderProgress } from "@remotion/vercel";
import { NextResponse } from "next/server";
import { autorizado } from "../auth";

// GET /api/progress?sandboxId=...&cmdId=...
// Devuelve { stage, overallProgress } y, al terminar, { stage: "done", url } con el MP4 en Vercel Blob.
export async function GET(req: Request) {
  if (!autorizado(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const sandboxId = searchParams.get("sandboxId");
  const cmdId = searchParams.get("cmdId");
  if (!sandboxId || !cmdId) {
    return NextResponse.json({ error: "Faltan sandboxId o cmdId" }, { status: 400 });
  }

  return NextResponse.json(await getRenderProgress({ sandboxId, cmdId }));
}
