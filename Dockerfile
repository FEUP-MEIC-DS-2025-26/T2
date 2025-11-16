#####################################################
# 1. Base image
#####################################################
FROM node:22-alpine AS base

# Instalar pnpm@8 (para ser consistente com o CI)
RUN npm install -g pnpm@8
RUN apk add --no-cache libc6-compat curl

#####################################################
# 2. Dependências de PRODUÇÃO (para a imagem final)
#####################################################
FROM base AS prod-deps
WORKDIR /app
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

# ficheiros de raiz (monorepo)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# se quiseres, podes também copiar o package.json da app:
# COPY apps/mips_product_page/package.json ./apps/mips_product_page/

# Instalar APENAS deps de produção e IGNORAR scripts (como o prisma generate)
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

#####################################################
# 3. Builder (precisa de TODAS as dependências)
#####################################################
FROM base AS builder-web
WORKDIR /app

# Instalar TODAS as dependências (incluindo dev-deps como 'prisma' e 'typescript')
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# Agora copiar o resto do código
COPY . .

# Correr o prisma generate AGORA, que 'prisma' está instalado
RUN pnpm exec prisma generate

# Desabilitar telemetry do Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Build do Next.js DENTRO de apps/mips_product_page
WORKDIR /app/apps/mips_product_page
RUN pnpm run build

#####################################################
# 4. Runner do web (A imagem final)
#####################################################
FROM base AS runner-web
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Copiar APENAS as dependências de PRODUÇÃO (do stage prod-deps)
COPY --from=prod-deps /app/node_modules ./node_modules

# Copiar os artefactos do BUILD (do stage builder-web)
# assumindo que tens `output: 'standalone'` no next.config de mips_product_page
COPY --from=builder-web /app/apps/mips_product_page/public ./public
COPY --from=builder-web /app/apps/mips_product_page/.next/standalone ./
COPY --from=builder-web /app/apps/mips_product_page/.next/static ./.next/static

# Copiar o cliente prisma gerado e o schema
COPY --from=builder-web /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder-web /app/prisma ./prisma

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
