# apps/mips_host/Dockerfile
FROM node:25-alpine3.21

# Install pnpm
RUN npm install -g pnpm@8

# Set workdir
WORKDIR /app

# Copy pnpm files (não há pnpm-lock aqui, só package.json)
COPY package.json ./

# Install dependencies (sem frozen-lockfile)
RUN pnpm install --force

# Copy source code
COPY . .

# Rsbuild/Vite dev servers need this to be accessible
ENV HOST=0.0.0.0
EXPOSE 3000

# Ajusta se o script não for "dev" ou usar outra porta
CMD ["pnpm", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
