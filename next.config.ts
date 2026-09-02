import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // scene-engine é um pacote ESM linkado (file:) — Next precisa transpilá-lo.
  transpilePackages: ["@publisher/scene-engine"],

  // Emite .next/standalone com o server e só as dependências rastreadas, para
  // a imagem final não carregar node_modules inteiro. Exigido pelo Dockerfile.
  output: "standalone",
};

export default nextConfig;
