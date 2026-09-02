FROM node:22-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
# packages/ vem junto porque @publisher/scene-engine é uma dependência
# `file:./packages/scene-engine` — sem a pasta, o install não resolve.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY . .

# NEXT_PUBLIC_* é gravado no bundle durante o build, não lido em runtime.
# Passar isso só como variável de ambiente do container NÃO funciona: o valor
# já está compilado dentro do JS servido ao navegador. Tem que vir como build
# arg. Sem ele, o front cai no default de src/lib/constants.ts
# (http://localhost:3001, sem o prefixo /api/v1) e todo request vira 404 —
# que na tela aparece como "credenciais inválidas".
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ARG NEXT_PUBLIC_MOCK=false
ENV NEXT_PUBLIC_MOCK=${NEXT_PUBLIC_MOCK}

RUN pnpm build

FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# output: 'standalone' já traz o server e as dependências rastreadas.
# static/ e public/ ficam de fora do trace e precisam ser copiados à mão.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD node -e "fetch('http://127.0.0.1:3000/login').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
