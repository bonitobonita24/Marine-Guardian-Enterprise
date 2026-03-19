

### 2026-03-20 | Phase 8 | Prisma 6 Query Engine not bundling in Next.js standalone Docker

- **Error**: "Prisma Client could not locate the Query Engine for runtime debian-openssl-3.0.x"
- **Fix**: Updated Dockerfile.web to copy entire /app/node_modules/.pnpm directory instead of individual paths
- **Prevention**: In Prisma 6 with pnpm monorepos, the .pnpm directory structure contains the query engine. Copy the entire .pnpm directory in the Dockerfile runner stage to ensure Prisma can find the engine at runtime.
