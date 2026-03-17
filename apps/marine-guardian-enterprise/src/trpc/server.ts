import { initTRPC, TRPCError } from "@trpc/server"
import { auth } from "../auth"
import superjson from "superjson"
import { prisma } from "@marine-guardian/db"
import { Role } from "@marine-guardian/shared"

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth()
  return {
    db: prisma,
    session,
    headers: opts.headers,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

// ─── Protected procedure (requires authentication) ────────────────────────────

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (ctx.session == null) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  const session = ctx.session
  return next({ ctx: { ...ctx, session } })
})

// ─── Role-restricted procedure (no tenant context) ────────────────────────────

export const authorizedProcedure = (allowedRoles: readonly Role[]) =>
  protectedProcedure.use(({ ctx, next }) => {
    const { role } = ctx.session.user
    if (!allowedRoles.includes(role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to perform this action",
      })
    }
    return next({ ctx })
  })

// ─── Tenant-scoped procedure ─────────────────────────────────────────────────

export const tenantProcedure = protectedProcedure.use(({ ctx, next }) => {
  const { tenantId } = ctx.session.user
  if (tenantId == null) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No active tenant",
    })
  }
  return next({ ctx: { ...ctx, tenantId } })
})

// ─── Role-restricted + tenant-scoped procedure ───────────────────────────────

export const authorizedTenantProcedure = (allowedRoles: readonly Role[]) =>
  tenantProcedure.use(({ ctx, next }) => {
    const { role } = ctx.session.user
    if (!allowedRoles.includes(role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to perform this action",
      })
    }
    return next({ ctx })
  })
