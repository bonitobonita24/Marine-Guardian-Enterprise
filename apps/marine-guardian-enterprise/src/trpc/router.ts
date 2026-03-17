import { router, protectedProcedure, tenantProcedure } from "./server"
import { z } from "zod"
import { Role, LGU_ROLES, BA_ROLES } from "@marine-guardian/shared"

export const appRouter = router({
  // Health check (public)
  health: protectedProcedure.query(({ ctx }) => {
    return {
      status: "ok",
      user: ctx.session.user.email,
    }
  }),

  // Get current user info
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.session.user
  }),

  // Get user's memberships (for tenant switching)
  memberships: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await ctx.db.tenantMembership.findMany({
      where: { userId: ctx.session.user.id },
      include: { tenant: true },
    })
    return memberships
  }),

  // Get tenant dashboard stats (tenant-specific)
  dashboard: tenantProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.tenantId
    
    const [
      fisherfolkCount,
      vesselCount,
      permitCount,
      incidentCount,
    ] = await Promise.all([
      ctx.db.fisherfolk.count({ where: { tenantId } }),
      ctx.db.vessel.count({ where: { tenantId } }),
      ctx.db.permit.count({ where: { tenantId } }),
      ctx.db.incident.count({ where: { tenantId } }),
    ])

    return {
      fisherfolkCount,
      vesselCount,
      permitCount,
      incidentCount,
    }
  }),

  // Fisherfolk CRUD
  fisherfolk: router({
    list: tenantProcedure.query(async ({ ctx }) => {
      const fisherfolks = await ctx.db.fisherfolk.findMany({
        where: { tenantId: ctx.tenantId, isActive: true },
        include: { barangay: true },
        orderBy: { lastName: "asc" },
      })
      return fisherfolks
    }),

    byId: tenantProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const fisherfolk = await ctx.db.fisherfolk.findFirst({
          where: { id: input.id, tenantId: ctx.tenantId },
          include: { 
            barangay: true,
            vessels: true,
            catchReports: { take: 10, orderBy: { catchDate: "desc" } },
          },
        })
        return fisherfolk
      }),

    create: tenantProcedure
      .input(
        z.object({
          firstName: z.string().min(1),
          middleName: z.string().optional(),
          lastName: z.string().min(1),
          dateOfBirth: z.string(),
          sex: z.enum(["MALE", "FEMALE"]),
          barangayId: z.string(),
          contactNumber: z.string().optional(),
          rsbsaNumber: z.string().optional(),
          activityCategories: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Get the next fisherfolk code for this tenant
        const lastFisherfolk = await ctx.db.fisherfolk.findFirst({
          where: { tenantId: ctx.tenantId },
          orderBy: { fisherfolkCode: "desc" },
        })

        const tenant = await ctx.db.tenant.findUnique({
          where: { id: ctx.tenantId },
        })

        const lastSeq = lastFisherfolk 
          ? parseInt(lastFisherfolk.fisherfolkCode.split("-")[1] || "0") 
          : 0
        const nextSeq = lastSeq + 1
        const fisherfolkCode = `${tenant?.slug.toUpperCase()}-${nextSeq.toString().padStart(6, "0")}`

        const fisherfolk = await ctx.db.fisherfolk.create({
          data: {
            tenantId: ctx.tenantId,
            fisherfolkCode,
            firstName: input.firstName,
            middleName: input.middleName,
            lastName: input.lastName,
            dateOfBirth: new Date(input.dateOfBirth),
            sex: input.sex as "MALE" | "FEMALE",
            barangayId: input.barangayId,
            contactNumber: input.contactNumber,
            rsbsaNumber: input.rsbsaNumber,
            activityCategories: input.activityCategories as any,
          },
        })

        return fisherfolk
      }),
  }),

  // Vessel CRUD
  vessel: router({
    list: tenantProcedure.query(async ({ ctx }) => {
      const vessels = await ctx.db.vessel.findMany({
        where: { tenantId: ctx.tenantId, isActive: true },
        include: { owner: true, homePortBarangay: true },
        orderBy: { vesselName: "asc" },
      })
      return vessels
    }),

    byId: tenantProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const vessel = await ctx.db.vessel.findFirst({
          where: { id: input.id, tenantId: ctx.tenantId },
          include: { 
            owner: true,
            homePortBarangay: true,
            permits: true,
            catchReports: { take: 10, orderBy: { catchDate: "desc" } },
          },
        })
        return vessel
      }),
  }),

  // Permit CRUD
  permit: router({
    list: tenantProcedure.query(async ({ ctx }) => {
      const permits = await ctx.db.permit.findMany({
        where: { tenantId: ctx.tenantId },
        include: { vessel: { include: { owner: true } }, approvedBy: true },
        orderBy: { createdAt: "desc" },
      })
      return permits
    }),

    byId: tenantProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const permit = await ctx.db.permit.findFirst({
          where: { id: input.id, tenantId: ctx.tenantId },
          include: { 
            vessel: { include: { owner: true, homePortBarangay: true } },
            approvedBy: true,
          },
        })
        return permit
      }),
  }),
})

export type AppRouter = typeof appRouter
