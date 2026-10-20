import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El bundle de Remotion se genera en el build (npm run bundle) y se sube a la sandbox desde la función.
  outputFileTracingIncludes: {
    "/api/render": ["./build/remotion-bundle/**/*"],
  },
  serverExternalPackages: ["@remotion/vercel", "@vercel/sandbox"],
};

export default nextConfig;
