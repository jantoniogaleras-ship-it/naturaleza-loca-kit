import { timingSafeEqual } from "node:crypto";

// n8n llama con la cabecera "Authorization: Bearer <RENDER_SECRET>".
export const autorizado = (req: Request) => {
  const secreto = process.env.RENDER_SECRET;
  if (!secreto) return false;
  const recibido = Buffer.from(req.headers.get("authorization") ?? "");
  const esperado = Buffer.from(`Bearer ${secreto}`);
  return recibido.length === esperado.length && timingSafeEqual(recibido, esperado);
};
