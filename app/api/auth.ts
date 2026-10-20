import { timingSafeEqual } from "node:crypto";

// n8n llama con la cabecera "Authorization: Bearer <RENDER_SECRET>".
// También se acepta la clave sola, sin «Bearer », y se ignoran los espacios de sobra al copiarla.
export const autorizado = (req: Request) => {
  const secreto = process.env.RENDER_SECRET?.trim();
  if (!secreto) return false;
  const cabecera = (req.headers.get("authorization") ?? "").trim().replace(/^Bearer\s+/i, "").trim();
  const recibido = Buffer.from(cabecera);
  const esperado = Buffer.from(secreto);
  return recibido.length === esperado.length && timingSafeEqual(recibido, esperado);
};
