# Lessons Memory — Spec-Driven Platform V11

# Entry format: ## YYYY-MM-DD — [ICON] [Title]

# Types: 🔴 gotcha | 🟡 fix | 🟤 decision | ⚖️ trade-off | 🟢 change

# READ ORDER: 🔴 first → 🟤 second → rest by relevance

# ---

```

Your existing entries below it are fine — don't delete them. From this point forward, Cline will write new entries in the typed format. You don't need to reformat old entries.

---

### Step 4 — Update .clinerules

Open `.clinerules` and add these lines to the context load order section. Find the section that lists the 9 docs and update it so `lessons.md` is explicitly first with the priority note:
```

Read .cline/memory/lessons.md FIRST — priority order: 🔴 gotchas → 🟤 decisions → rest

```

Also add a line acknowledging Rules 18/19/20 so Cline picks them up from the new CLAUDE.md immediately.

If editing `.clinerules` feels risky, skip it — Cline will read it from the new CLAUDE.md regardless since Rule 4 is now explicit.

---

### Step 5 — Resume Session to reconnect context

Open Cline (or Claude Code), say:
```

Resume Session

```

Attach these 3 docs:
- `project.memory.md`
- `docs/IMPLEMENTATION_MAP.md`
- `docs/DECISIONS_LOG.md`

Cline will confirm your app context, what's built, and what the locked decisions are. It now operates under all 20 V11 rules.

---

### Step 6 — Continue Phase 5

You're back exactly where you were. Say:
```

Start Phase 5

# Cline Lessons — Marine Guardian Enterprise

> Format: date | phase | error | fix | prevention
> Read this file FIRST before every task to avoid repeating known errors.
> Append here whenever an error is resolved, never delete entries.

---

## Format Reference

```
### YYYY-MM-DD | Phase X | Error Type
- **Error**: description of what went wrong
- **Fix**: exact steps taken to resolve
- **Prevention**: how to avoid this in future sessions
```

---

### 2026-03-15 | Phase 4 | @radix-ui packages that don't exist

- **Error**: `@radix-ui/react-button`, `@radix-ui/react-badge`, `@radix-ui/react-sheet` are not in npm registry
- **Fix**: Remove from packages/ui/package.json. Use `@radix-ui/react-slot` for Button (asChild). Badge needs no Radix primitive. Sheet is built on Dialog — use `@radix-ui/react-dialog` instead.
- **Prevention**: Verify every @radix-ui package name before scaffolding. Correct list: react-slot, react-dialog, react-dropdown-menu, react-select, react-tabs, react-toast, react-tooltip, react-avatar, react-checkbox, react-switch, react-label, react-separator, react-scroll-area, react-accordion, react-alert-dialog, react-popover, react-progress, react-icons. There is NO react-button, react-badge, or react-sheet.

### 2026-03-15 | Phase 4 | Prisma $use removed in v6

- **Error**: `Property '$use' does not exist on type 'PrismaClient'` — $use middleware was removed in Prisma v6
- **Fix**: Rewrite using `Prisma.defineExtension()` with `query.$allModels.create` and `createMany` handlers
- **Prevention**: In Prisma v6+, always use `prismaClient.$extends(Prisma.defineExtension(...))` for query interceptors. Never use $use.

### 2026-03-15 | Phase 4 | ioredis dual-version in monorepo with BullMQ

- **Error**: BullMQ bundles ioredis@5.9.3 internally; our packages/jobs resolved ioredis@5.10.0 — TypeScript sees them as incompatible types
- **Fix**: Add `"pnpm": { "overrides": { "ioredis": "5.9.3" } }` to root package.json
- **Prevention**: When using BullMQ, always pin ioredis to the exact version BullMQ declares as peer dependency. Check BullMQ's package.json to find the pinned ioredis version.

### 2026-03-15 | Phase 4 | httpSubscriptionLink does not support headers in tRPC v11

- **Error**: `'headers' does not exist in type 'HTTPSubscriptionLinkOptions'`
- **Fix**: Remove headers option from httpSubscriptionLink. For SSE subscriptions requiring auth, pass token as a query parameter from the caller.
- **Prevention**: In tRPC v11, only httpBatchLink/httpLink support the headers option. httpSubscriptionLink (SSE) does not.

### 2026-03-15 | Phase 4 | AJV v8 needs ajv-formats for "uri" format + allowUnionTypes for array types

- **Error**: `unknown format "uri"` + `strict mode: use allowUnionTypes to allow union type keyword`
- **Fix**: `import addFormats from "ajv-formats"`, call `addFormats(ajv)`, and pass `{ allowUnionTypes: true }` to new Ajv()
- **Prevention**: AJV v8 requires explicit format registration. Always import and call addFormats(ajv) when using format: "uri", "email", etc. in schemas. Add allowUnionTypes: true when using type arrays like ["string","boolean","null"].

### 2026-03-15 | Phase 4 | inputs.schema.json default field was string-only

- **Error**: Prisma/Zod schemas have boolean defaults (false, true) and null defaults — schema rejected these
- **Fix**: Change `"default": { "type": "string" }` to `"default": { "type": ["string", "boolean", "number", "null"] }`
- **Prevention**: When deriving schema for entity fields from Prisma, the `default` property must accommodate all Prisma default types (string, boolean, number, null). Never restrict to string-only.

---

### 2026-03-15 | Phase 5 Audit | Phase 5 validation must run full `pnpm turbo typecheck`, not per-package tsc

- **Error**: Original Phase 5 only ran `tsc --noEmit` per package (shared, db, jobs, api-client, storage, ui). This missed errors that only surface at app level: TS18003 in bluesentinel-mobile, TS2742 in marine-guardian-enterprise, and @types/react dual-version conflict.
- **Fix**: Always end Phase 5 with `pnpm turbo typecheck --force` (full pipeline, all 15 tasks, no cache).
- **Prevention**: Phase 5 checklist MUST include `pnpm turbo typecheck` as the FINAL step covering all apps. Never mark Phase 5 as green until the full turbo typecheck pipeline passes.

### 2026-03-15 | Phase 5 Audit | Next.js App Router components need explicit `JSX.Element` return type annotations

- **Error**: `TS2742: The inferred type of 'RootLayout' cannot be named without a reference to '.pnpm/@types+react@18.3.28/...'`. TypeScript can infer the return type but can't express it portably when two @types/react versions coexist.
- **Fix**: Add explicit return type annotations to all Next.js page and layout components:
  ```typescript
  import type { JSX, ReactNode } from "react";
  export default function RootLayout({ children }: { children: ReactNode }): JSX.Element { ... }
  export default function HomePage(): JSX.Element { ... }
  ```
- **Prevention**: All React component functions in `apps/marine-guardian-enterprise` MUST have explicit `): JSX.Element` return type annotations. This is non-negotiable in strict mode with monorepo @types/react.

### 2026-03-15 | Phase 5 Audit | Pin @types/react to a single version via pnpm overrides in React monorepos

- **Error**: `packages/ui` used `"@types/react": "~18.3.0"` while `apps/marine-guardian-enterprise` used `"@types/react": "^19.0.0"`. pnpm installed BOTH. TypeScript resolved `ReactNode` differently in different contexts → TS2742 `ReactNode is not assignable to ReactNode`.
- **Fix**: Add to root `package.json`:
  ```json
  "pnpm": { "overrides": { "@types/react": "^19.0.0", "@types/react-dom": "^19.0.0" } }
  ```
  Then run `pnpm install`.
- **Prevention**: In ANY React monorepo, always force a single @types/react version via pnpm overrides. For this project: always `^19.0.0`. This takes priority over individual package devDependency pins.

### 2026-03-15 | Phase 5 Audit | Next.js 15 uses `serverExternalPackages` (not `experimental.serverComponentsExternalPackages`)

- **Error**: `experimental.serverComponentsExternalPackages` was the Next.js 14 config key. It was promoted and renamed in Next.js 15 to `serverExternalPackages` at the top level (not inside `experimental`).
- **Fix**: Remove the `experimental` wrapper and use `serverExternalPackages: ["@prisma/client", "prisma"]` as a top-level key in `next.config.ts`.
- **Prevention**: Never use `experimental.serverComponentsExternalPackages` in this project. It is deprecated in Next.js 15 and will generate a warning.

### 2026-03-15 | Phase 5 Audit | Every app scaffold must include at least one .ts/.tsx source file

- **Error**: `TS18003: No inputs were found in config file 'apps/bluesentinel-mobile/tsconfig.json'`. The Phase 4 scaffold created package.json + app.json + tsconfig.json for bluesentinel-mobile but NO source files. TypeScript's `include` glob matched zero files.
- **Fix**: Create a minimal Expo Router entry point: `apps/bluesentinel-mobile/app/_layout.tsx` with a `<Slot />` component.
- **Prevention**: Every app scaffold MUST include at least one `.ts` or `.tsx` source file so TypeScript's `include` glob has at least one match. For Expo Router apps, always create `app/_layout.tsx` as the minimum viable entry point.
