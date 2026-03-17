import { initTRPC, TRPCError } from "@trpc/server"
import { auth } from "../auth"
import superjson from "superjson"
import { prisma, withTenantContext } from "@marine-guardian/db"
import { Role } from "@marine-guardian/shared"

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth()
  
  return {
    db: prisma,
    session,
    ...opts,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  })
})

// Procedure that requires specific roles
export const authorizedProcedure = (allowedRoles: readonly Role[]) =>
  protectedProcedure.use(async ({ ctx, next }) => {
    const userRole = ctx.session.user.role
    
    if (!allowedRoles.includes(userRole)) {
      throw new TRPCError({ 
        code: "FORBIDDEN",
        message: "You don't have permission to perform this action"
      })
    }
    
    return next({ ctx })
  })

// Procedure that runs within tenant context
export const tenantProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const tenantId = ctx.session.user.tenantId
  
  if (!tenantId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No active tenant"
    })
  }
  
  // Wrap the query with tenant context
  return next({
    ctx: {
      ...ctx,
      tenantId,
    },
  })
})
