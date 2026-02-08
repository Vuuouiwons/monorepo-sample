# TypeScript Monorepo (Turborepo + npm Workspaces)

This is a minimal monorepo boilerplate demonstrating **Internal Packages** pattern. It uses **npm workspaces** for dependency linking and **Turborepo** for task orchestration.

## 1. Quick Start

**Prerequisites:**

* Node.js (v20+)
* npm (v10+)

**Installation:**

```bash
# 1. Install dependencies (links workspaces automatically)
npm install

# 2. Start Development (Parallel execution of API and Web)
npm run dev

```

**Common Commands:**
| Command                            | Action                              | Scope    |
| :--------------------------------- | :---------------------------------- | :------- |
| `npm run dev`                      | Starts API (3000) & Web (5173)      | Global   |
| `npm run build`                    | Builds all apps/packages            | Global   |
| `npm run type-check`               | Runs `tsc --noEmit` across all apps | Global   |
| `npx turbo run build --filter=web` | Build ONLY the web app              | Targeted |
| `npx turbo graph`                  | Visualize dependency graph          | Debug    |

---

## 2. Architecture Overview

### The "Internal Package" Pattern

Unlike traditional npm packages, the `packages/math` library is **not built** (no `.js` files in dist). Instead, it exports raw TypeScript code.

* **Web (`apps/web`):** Uses **Vite** to transpile the shared package on the fly.
* **API (`apps/api`):** Uses **tsx** (esbuild) to run the shared package directly from source.

**Benefit:** Zero-latency feedback loop. You change code in `packages/math`, and both apps hot-reload instantly without running a watcher build in the package.

### Dependency Wiring

1. **Workspaces (`package.json`):**
`"workspaces": ["apps/*", "packages/*"]` tells npm to look in these folders.
2. **Linking (`package.json` in apps):**
`"@repo/math": "*"` tells npm to symlink the local folder instead of fetching from registry.
3. **Resolution (`tsconfig.base.json`):**
`"paths"` are NOT used here. We rely on standard Node module resolution because npm creates the physical symlinks in `node_modules`.

---

## 3. Directory Structure

```text
.
├── package.json          # Root manifest (Defines workspaces & packageManager)
├── turbo.json            # Pipeline config (Caching rules)
├── tsconfig.base.json    # Shared compiler options (Strict mode, etc.)
├── apps
│   ├── api               # Express (Node/CommonJS context)
│   │   ├── src/index.ts
│   │   └── tsconfig.json # Extends base, includes src
│   └── web               # Vite (Browser/ESM context)
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

If you need to recreate this from scratch, these are the critical "glue" configurations.

### Root `package.json`

**Why:** Sets up the symlinks and locks the package manager version for Turbo.

```json
{
  "workspaces": ["apps/*", "packages/*"],
  "packageManager": "npm@11.4.2" 
}

```

### Shared `tsconfig.base.json`

**Why:** Ensures consistency. Apps extend this to inherit strict rules.

```json
{
  "compilerOptions": {
    "strict": true,
    "composite": true,
    "declaration": true
  }
}

```

### Package Definition (`packages/math/package.json`)

**Why:** `main` points to TS source so standard imports work without building.

```json
{
  "name": "@repo/math",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}

```

---

## 5. Troubleshooting / Gotchas

**1. "Missing packageManager field"**

* **Cause:** Turbo requires deterministic builds.
* **Fix:** Add `"packageManager": "npm@X.X.X"` to root `package.json`.

**2. `tsc` fails with "Help" text**

* **Cause:** You are running `tsc` in a folder that has no `tsconfig.json`.
* **Fix:** Ensure every workspace has a `tsconfig.json` that extends the base config.

**3. VS Code not finding imports**

* **Cause:** IntelliSense hasn't refreshed the file system links.
* **Fix:** `Ctrl+Shift+P` -> `TypeScript: Restart TS Server`.

**4. Module Resolution Errors**

* **Cause:** Importing ESM (Vite) into CommonJS (Node) or vice versa.
* **Fix:** We use `tsx` for the API to handle ESM/TS interoperability seamlessly in dev. For production `apps/api` builds, you would typically compile to JS using `tsup` or `tsc`.