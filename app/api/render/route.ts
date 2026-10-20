import path from "node:path";
import { addBundleToSandbox, createSandbox, renderMediaOnVercel } from "@remotion/vercel";
import { NextResponse } from "next/server";
import { autorizado } from "../auth";

// Crear la sandbox (dependencias + navegador) tarda 1–2 minutos; el render sigue después en segundo plano.
export const maxDuration = 300;

const BUNDLE_DIR = path.join(process.cwd(), "build", "remotion-bundle");

// POST /api/render  — cuerpo: los datos del Short (ver remotion/schema.ts).
// Devuelve { sandboxId, cmdId }; el progreso y la URL final se piden a /api/progress.
export async function POST(req: Request) {
  if (!autorizado(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const props = await req.json().catch(() => null);
  if (!props || !Array.isArray(props.planos) || !Array.isArray(props.voz?.palabras)) {
    return NextResponse.json({ error: "Datos del Short no válidos" }, { status: 400 });
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) return NextResponse.json({ error: "Falta BLOB_READ_WRITE_TOKEN" }, { status: 500 });

  const sandbox = await createSandbox();
  await addBundleToSandbox({ sandbox, bundleDir: BUNDLE_DIR });

  const nombre = String(props.animal ?? "short")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  const { sandboxId, cmdId } = await renderMediaOnVercel({
    sandbox,
    compositionId: "Short",
    inputProps: props,
    codec: "h264",
    crf: 18,
    detached: true,
    detachedSandboxTimeoutInMilliseconds: 10 * 60 * 1000,
    vercelBlob: {
      blobToken,
      access: "public",
      blobPath: `shorts/${new Date().toISOString().slice(0, 10)}/${nombre}-${Date.now()}.mp4`,
    },
  });

  return NextResponse.json({ sandboxId, cmdId });
}
