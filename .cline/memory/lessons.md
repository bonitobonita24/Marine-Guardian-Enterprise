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
