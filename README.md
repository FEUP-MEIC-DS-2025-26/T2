# 🧩 Product Page — Monorepo Setup

This repository contains the **core product page service**, built with **Next.js**, **PostgreSQL**, and **Prisma ORM**, and designed as a **monorepo** to allow other teams to extend functionality (microservices, shared packages, etc).

---

## Quickstart (for Developers)

### 1️⃣ Install Dependencies

```bash
# Run this only once after cloning the repo
npm install
```

### 2️⃣ Start PostgreSQL (via Docker)

You can use Docker Compose (recommended) or a single Docker command.

**Option 1 – Using docker-compose.yml**
```bash
docker-compose up -d
```

**Option 2 – Direct Docker command**
```bash
docker run --name product-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres   -e POSTGRES_DB=product-page -p 5433:5432 -d postgres:16
```

---

### 3️⃣ Environment Variables

Copy the example file and adjust if needed:
```bash
cp .env.example .env
```

Example `.env`:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/product-page?schema=public"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

---

### 4️⃣ Prisma Setup

If you make **any changes** to the Prisma schema (`prisma/schema.prisma`), you must run migrations and regenerate the client.

```bash
# Apply database migrations (replace <descriptive_name> with your change)
npx prisma migrate dev --name <descriptive_name>

# Regenerate Prisma client if VS Code shows type errors (e.g., "Cannot find module '@prisma/client'")
npx prisma generate
```

---

### 5️⃣ Run the Development Server

```bash
npm run dev:web
```

This will start the Next.js web application located at **apps/web** on [http://localhost:3000](http://localhost:3000).

---

## 🧱 Repository Structure

```
.
├── apps/
│   └── web/               # Main Next.js application (product page)
├── packages/              # Shared code (utils, UI components, etc.)
├── docker-compose.yml     # Local PostgreSQL setup
├── .env.example           # Example environment variables
├── package.json           # Root configuration for npm workspaces
└── prisma/                # (Optional) Prisma schema and migrations
```

---

## Project Context

This service provides the **core product display functionality**, which other teams will extend with new features and microservices.

### Main User Stories (Core Team Scope)
1. Display product name, images, price, and basic information.  
2. Show product technical details (size, materials, origin, etc.) in a clear format.  
3. Present a timeline of the product’s history and cultural significance.  
4. Display all ratings and comments with sorting options (newest, oldest, highest, lowest).

---

## Development Workflow

### Branching
- Use feature branches:  
  ```
  feature/<issue-number>-short-description
  ```
  Example:
  ```
  feature/12-product-timeline
  ```

### Commit Convention
Follow **Conventional Commits**:
```
feat: add product specs section
fix: incorrect image rendering on product page
chore: update dependencies
```

### Pull Requests
- Keep PRs small and focused.  
- Reference the issue number in the PR description.  
- Request reviewers (CODEOWNERS will auto-suggest).

---

## Monorepo Commands

| Command | Description |
|----------|-------------|
| `npm install` | Install all dependencies (root + workspaces) |
| `npm run dev:web` | Run the Next.js dev server |
| `npm run build:web` | Build the web app for production |
| `npm run start:web` | Start the built app |
| `npm run lint` | Lint code in all workspaces |
| `npm run format` | Format code with Prettier |
| `npm run bootstrap` | Reinstall dependencies (clean setup) |

---

## CI/CD (GitHub Actions)

Every push or pull request to `main` triggers:
1. Node setup and dependency installation  
2. Build check (`npm run build:web`)  
3. Lint check (`npm run lint`)

This ensures all code entering `main` passes build and formatting checks.

---

## Contributing Guidelines

- Always update your local branch before committing (`git pull origin main`).
- Never commit directly to `main`.
- Always test your changes locally before opening a PR.
- Document new scripts, migrations, or environment variables.

---

## Database Summary

**Default Database Configuration:**
- User: `postgres`
- Password: `postgres`
- Database: `product-page`
- Port: `5433`

Access with:
```bash
psql -h localhost -U postgres -d product-page -p 5433
```

---

## Additional Notes

- The database runs locally and can be reset by removing the container:
  ```bash
  docker rm -f product-db
  ```
- Prisma migrations are tracked in the `/prisma/migrations` folder.
- Each team extending this repo should create a new workspace under `/apps` or `/packages`.

---

## Support

If you run into issues:
1. Check your `.env` configuration.
2. Ensure Docker is running and the database port (5433) is not in use.
3. Reinstall dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```
4. Regenerate Prisma client:
   ```bash
   npx prisma generate
   ```

---

Made by the Core Product Team
