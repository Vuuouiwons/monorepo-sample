# TypeScript Monorepo (Turborepo + pnpm Workspaces)

This is a minimal monorepo boilerplate demonstrating the **Internal Packages** pattern. It uses **pnpm workspaces** for dependency linking and **Turborepo** for task orchestration.

## 1. Quick Start

**Prerequisites:**

* Node.js (v20+)
* pnpm (v9+)
* Docker (for containerized builds)

**Installation:**

```bash
# 1. Install dependencies (links workspaces automatically via pnpm)
pnpm install

# 2. Start Development (Parallel execution of API and Web)
pnpm dev

```

**Common Commands:**

| Command                                            | Action                                   | Scope                  |
| -------------------------------------------------- | ---------------------------------------- | ---------------------- |
| `pnpm dev`                                         | Starts API (3000) & Web (5173)           | Global                 |
| `pnpm build`                                       | Builds all apps/packages                 | Global                 |
| `pnpm type-check`                                  | Runs `tsc --noEmit` across all apps      | Global                 |
| `pnpm --filter web build`                          | (or `npx turbo run build --filter=web`)* | Build ONLY the web app |
| `docker build -f apps/api/Dockerfile -t api-app .` | Builds the Docker image for the API      | Targeted               |
| `docker build -f apps/web/Dockerfile -t web-app .` | Builds the Docker image for the Web app  | Targeted               |

---

## 2. Architecture Overview

### The "Internal Package" Pattern

Unlike traditional packages, the `packages/math` library is **not built** (no `.js` files in dist). Instead, it exports raw TypeScript code.

* **Web (`apps/web`):** Uses **Vite** to transpile the shared package on the fly.
* **API (`apps/api`):** Uses **tsx** (esbuild) to run the shared package directly from source.

**Benefit:** Zero-latency feedback loop. You change code in `packages/math`, and both apps hot-reload instantly without running a watcher build in the package.

### Dependency Wiring

1. **Workspaces (`pnpm-workspace.yaml`):**
Tells pnpm exactly which directories contain your apps and packages.
2. **Linking (`package.json` in apps):**
`"@repo/math": "workspace:*"` tells pnpm to tightly link the local workspace version rather than looking at the public registry.
3. **Resolution (`tsconfig.base.json`):**
`"paths"` are NOT used here. We rely on standard Node module resolution because pnpm creates physical symlinks in the local `node_modules`.

---

## 3. Directory Structure

```text
.
├── package.json          # Root manifest (Defines packageManager)
├── pnpm-workspace.yaml   # Defines the pnpm workspaces explicitly
├── turbo.json            # Pipeline config (Caching rules)
├── tsconfig.base.json    # Shared compiler options (Strict mode, etc.)
├── apps
│   ├── api               # Express (Node/CommonJS context)
│   │   ├── Dockerfile    # Docker build instructions for API
│   │   ├── src/index.ts
│   │   └── tsconfig.json # Extends base, includes src
│   └── web               # Vite (Browser/ESM context)
│       ├── Dockerfile    # Docker build instructions for Web
│       ├── src/main.ts
│       └── tsconfig.json # Extends base, configures DOM types
└── packages
    └── math              # Shared Logic (Stateless)
    │   ├── src/index.ts
    │   └── package.json  # main: "./src/index.ts" (Raw TS entry)
    └── date              # Shared Logic (Stateless)
        ├── src/index.ts
        └── package.json  # main: "./src/index.ts" (Raw TS entry)

```

---

## 4. Configuration Reference

If you need to recreate this from scratch, these are the critical "glue" configurations for pnpm.

### Workspace Definition (`pnpm-workspace.yaml`)

**Why:** pnpm requires a dedicated YAML file at the root to declare the monorepo structure, rather than using the `package.json` like npm or Yarn.

```yaml
packages:
  - 'apps/*'
  - 'packages/*'

```

### Root `package.json`

**Why:** Locks the package manager version for Turbo to ensure deterministic builds.

```json
{
  "private": true,
  "packageManager": "pnpm@9.1.0" 
}

```

### Shared `tsconfig.base.json`

**Why:** Ensures consistency. Apps extend this to inherit strict rules.

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false,
    "module": "ESNext",
    "target": "ES2022"
  }
}

```

### Package Definition (`packages/math/package.json`)

**Why:** `main` points to TS source so standard imports work without building.

```json
{
  "name": "@repo/math",
  "main": "./dist/index.js",
  "types": "./dist/index.d.js"
}

```
