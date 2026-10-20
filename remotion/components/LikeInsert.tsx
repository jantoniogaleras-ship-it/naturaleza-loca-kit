import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { DURACION_LIKE, DURACION_LIKE_ORIGINAL } from "../schema";

// Inserto de like del kit original a pantalla completa, con su propio sonido.
// Va algo más lento que el original (1,8 s → 2,4 s) para que dé tiempo a verlo.
export const LikeInsert = () => (
  <AbsoluteFill>
    <OffthreadVideo
      src={staticFile("kit/like_insert.mp4")}
      playbackRate={DURACION_LIKE_ORIGINAL / DURACION_LIKE}
      volume={0.8}
      style={{ width: "100%", height: "100%" }}
    />
  </AbsoluteFill>
);
