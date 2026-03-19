

### 2026-03-20 | Phase 8 | Prisma 6 Query Engine not bundling in Next.js standalone Docker

- **Error**: "Prisma Client could not locate the Query Engine for runtime debian-openssl-3.0.x"
- **Fix**: Updated Dockerfile.web to copy entire /app/node_modules/.pnpm directory instead of individual paths
- **Prevention**: In Prisma 6 with pnpm monorepos, the .pnpm directory structure contains the query engine. Copy the entire .pnpm directory in the Dockerfile runner stage to ensure Prisma can find the engine at runtime.

### 2026-03-20 | Phase 8 | pnpm workspace packages not resolving in worker Docker

- **Error**: "Cannot find module '@marine-guardian/jobs'" - module resolution failure
- **Root Causes**:
  1. pnpm creates symlinks in `.pnpm/node_modules/@marine-guardian/` pointing to `/app/packages/<pkg>`
  2. These symlinks were not preserved when copying between Dockerfile stages
  3. The `/app/packages/` directory wasn't copied to the runner
  4. `@prisma/client` wasn't initialized because `prisma generate` wasn't run in deps stage
- **Fix**: 
  - Copy full `packages` directory in deps stage
  - Copy packages from deps to runner stage
  - Create symlinks for `@marine-guardian/*` packages in runner
  - Run `prisma generate` in deps stage (before builder stage uses it)
- **Prevention**: When using pnpm workspaces in Docker:
  1. Always copy the full `packages` directory
  2. Run `prisma generate` in the deps stage if any package uses Prisma
  3. Create symlinks in runner if pnpm's workspace protocol symlinks aren't preserved
