# apps/mips_backend/Dockerfile

FROM node:22-alpine

# Workdir dentro do container
WORKDIR /app

# pnpm + deps base
RUN npm install -g pnpm@8 \
  && apk add --no-cache libc6-compat

# Copiar apenas o package.json + pnpm-lock do backend
COPY apps/mips_backend/package.json apps/mips_backend/pnpm-lock.yaml ./

# Instalar dependências do backend
RUN pnpm install --force

# Copiar a pasta prisma da root para dentro do container
COPY prisma ./prisma

# Copiar o código do backend
COPY apps/mips_backend/. .

# Gerar o Prisma Client (usa schema em ./prisma/schema.prisma)
RUN npx prisma generate

# Variáveis básicas
ENV NODE_ENV=development
ENV PORT=3003

EXPOSE 3003

# Ajusta se o script "dev" do backend tiver outro nome
CMD ["pnpm", "dev"]
