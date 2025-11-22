# apps/mips_product_page/Dockerfile

# Base image with pnpm
FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@8 \
  && apk add --no-cache libc6-compat

# --- Dependencies layer ---
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
# Recria o lockfile dentro da imagem se for incompatível
RUN pnpm install --force


# --- Development image ---
FROM deps AS dev
WORKDIR /app
COPY . .
ENV HOST=0.0.0.0
EXPOSE 3001
# Adjust script name/flags if your package.json uses something else
CMD ["pnpm", "dev", "--", "--host", "0.0.0.0", "--port", "3001"]

# --- Build image ---
FROM deps AS build
WORKDIR /app
COPY . .
# Adjust "build" script name if needed
RUN pnpm build

# --- Production runtime image ---
FROM node:22-alpine AS prod
WORKDIR /app
RUN apk add --no-cache libc6-compat \
  && npm install -g pnpm@8

# Copy build output (assuming it goes to /app/dist – change if needed)
COPY --from=build /app/dist ./dist

ENV HOST=0.0.0.0
EXPOSE 3001
# Use whatever you use to serve the built bundle (rsbuild preview, vite preview, custom server, etc.)
CMD ["pnpm", "preview", "--", "--host", "0.0.0.0", "--port", "3001"]
