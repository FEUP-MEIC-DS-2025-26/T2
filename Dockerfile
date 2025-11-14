#####################################################
# 1. Base image para todos os apps
#####################################################
# Usar a imagem oficial do pnpm é mais fácil
FROM node:22-alpine AS base

# Instalar pnpm
RUN npm install -g pnpm

RUN apk add --no-cache libc6-compat curl
WORKDIR /app

#####################################################
# 2. Dependências do web (Next.js + Prisma)
#####################################################
FROM base AS deps-web

ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

# Copiar ficheiros de package (agora com pnpm)
COPY package.json pnpm-lock.yaml ./

# Instalar dependências de produção com pnpm
RUN pnpm install --prod --frozen-lockfile

#####################################################
# 3. Builder do web
#####################################################
FROM base AS builder-web

WORKDIR /app

# Copiar todos os ficheiros da aplicação web
COPY . .

# Copiar schema Prisma antes de gerar client
COPY prisma ./prisma

# Gerar Prisma client (usando pnpm exec)
RUN pnpm exec prisma generate

# Copiar node_modules do stage deps
COPY --from=deps-web /app/node_modules ./node_modules

# Desabilitar telemetry do Next.js
ENV NEXT_TELEMETRY_DISABLED 1

# Build do Next.js (usando pnpm)
RUN pnpm run build

#####################################################
# 4. Runner do web
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

# Copiar build e assets
COPY --from=builder-web /app/public ./public
COPY --from=builder-web /app/.next/standalone ./
COPY --from=builder-web /app/.next/static ./.next/static
COPY --from=builder-web /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder-web /app/prisma ./prisma

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]