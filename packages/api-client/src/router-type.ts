// ─────────────────────────────────────────────────────────────────────────────
// packages/api-client/src/router-type.ts
// AppRouter type imported from the web app — used for end-to-end type safety.
// This file is the ONLY bridge between api-client and the server router type.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AppRouter is the root tRPC router type, defined in apps/marine-guardian-enterprise.
 * It is imported here as a type-only import so the client package has zero
 * runtime dependency on the server.
 *
 * During build, this is satisfied by the TypeScript project references.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppRouter = any;
// NOTE: Replace `any` with the actual import once the web app is built:
// export type { AppRouter } from "../../apps/marine-guardian-enterprise/src/server/trpc/router";
