import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";

// Inserto de like del kit original (1,8 s a pantalla completa, con su propio sonido).
export const LikeInsert = () => (
  <AbsoluteFill>
    <OffthreadVideo src={staticFile("kit/like_insert.mp4")} style={{ width: "100%", height: "100%" }} />
  </AbsoluteFill>
);
