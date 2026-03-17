import {
  router,
  protectedProcedure,
  tenantProcedure,
  authorizedProcedure,
  authorizedTenantProcedure,
} from "./server"
import { z } from "zod"
import {
  Role,
  ActivityCategory,
  VesselType,
  PermitType,
  PermitStatus,
  IncidentStatus,
  PatrolStatus,
  ProgramType,
  Sex,
} from "@marine-guardian/shared"

// ─── Role sets ───────────────────────────────────────────────────────────────

const APPROVE_ROLES = [Role.SUPER_ADMIN, Role.FISHERIES_OFFICER] as const
const ADMIN_ROLES = [Role.SUPER_ADMIN, Role.BA_ADMIN] as const

// ─── Root router ─────────────────────────────────────────────────────────────

export const appRouter = router({
  // ── Health ─────────────────────────────────────────────────────────────────
  health: protectedProcedure.query(({ ctx }) => ({
    status: "ok" as const,
    tenantId: ctx.session.user.tenantId,
  })),

  // ── Me / session ───────────────────────────────────────────────────────────
  me: protectedProcedure.query(({ ctx }) => ctx.session.user),

  memberships: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.tenantMembership.findMany({
      where: { userId: ctx.session.user.id, isActive: true },
      include: { tenant: true },
    })
  }),

  // ── Settings: switch active tenant ─────────────────────────────────────────
  settings: router({
    switchTenant: protectedProcedure
      .input(z.object({ tenantId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const membership = await ctx.db.tenantMembership.findFirst({
          where: {
            userId: ctx.session.user.id,
            tenantId: input.tenantId,
            isActive: true,
          },
          include: { tenant: true },
        })
        if (membership == null) {
          throw new Error("No membership for this tenant")
        }
        await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: { lastActiveTenantId: input.tenantId },
        })
        return {
          tenantId: membership.tenantId,
          tenantSlug: membership.tenant.slug,
          role: membership.role,
        }
      }),
  }),

  // ── Dashboard ──────────────────────────────────────────────────────────────
  dashboard: router({
    lguStats: tenantProcedure.query(async ({ ctx }) => {
      const { tenantId } = ctx
      const [fisherfolkCount, vesselCount, permitCount, incidentCount, activePermitCount, recentCatch] =
        await Promise.all([
          ctx.db.fisherfolk.count({ where: { tenantId, isActive: true } }),
          ctx.db.vessel.count({ where: { tenantId, isActive: true } }),
          ctx.db.permit.count({ where: { tenantId } }),
          ctx.db.incident.count({ where: { tenantId } }),
          ctx.db.permit.count({ where: { tenantId, status: PermitStatus.APPROVED } }),
          ctx.db.catchReport.aggregate({ where: { tenantId }, _sum: { catchVolumeKg: true } }),
        ])
      return {
        fisherfolkCount,
        vesselCount,
        permitCount,
        incidentCount,
        activePermitCount,
        totalCatchKg: recentCatch._sum.catchVolumeKg ?? 0,
      }
    }),
  }),

  // ── Barangay ───────────────────────────────────────────────────────────────
  barangay: router({
    list: tenantProcedure.query(async ({ ctx }) => {
      return ctx.db.barangay.findMany({
        where: { tenantId: ctx.tenantId, isActive: true },
        orderBy: { name: "asc" },
      })
    }),
  }),

  // ── Species ────────────────────────────────────────────────────────────────
  species: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return ctx.db.species.findMany({ where: { isGlobal: true }, orderBy: { name: "asc" } })
    }),
  }),

  // ── Fisherfolk ─────────────────────────────────────────────────────────────
  fisherfolk: router({
    list: tenantProcedure
      .input(
        z
          .object({
            search: z.string().optional(),
            barangayId: z.string().optional(),
            isActive: z.boolean().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        return ctx.db.fisherfolk.findMany({
          where: {
            tenantId: ctx.tenantId,
            isActive: input?.isActive ?? true,
            ...(input?.barangayId != null ? { barangayId: input.barangayId } : {}),
            ...(input?.search != null
              ? {
                  OR: [
                    { firstName: { contains: input.search, mode: "insensitive" } },
                    { lastName: { contains: input.search, mode: "insensitive" } },
                    { fisherfolkCode: { contains: input.search, mode: "insensitive" } },
                    { rsbsaNumber: { contains: input.search, mode: "insensitive" } },
                  ],
                }
              : {}),
          },
          include: { barangay: true },
          orderBy: { lastName: "asc" },
        })
      }),

    byId: tenantProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        return ctx.db.fisherfolk.findFirst({
          where: { id: input.id, tenantId: ctx.tenantId },
          include: {
            barangay: true,
            vessels: { where: { isActive: true } },
            catchReports: {
              take: 10,
              orderBy: { catchDate: "desc" },
              include: { species: true },
            },
            programBeneficiaries: { include: { program: true } },
          },
        })
      }),

    checkRsbsa: tenantProcedure
      .input(z.object({ rsbsaNumber: z.string(), excludeId: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        const existing = await ctx.db.fisherfolk.findFirst({
          where: {
            tenantId: ctx.tenantId,
            rsbsaNumber: input.rsbsaNumber,
            ...(input.excludeId != null ? { NOT: { id: input.excludeId } } : {}),
          },
        })
        return { exists: existing != null }
      }),

    create: tenantProcedure
      .input(
        z.object({
          firstName: z.string().min(1),
          middleName: z.string().optional(),
          lastName: z.string().min(1),
          dateOfBirth: z.string(),
          sex: z.nativeEnum(Sex),
          barangayId: z.string(),
          contactNumber: z.string().optional(),
          rsbsaNumber: z.string().optional(),
          activityCategories: z.array(z.nativeEnum(ActivityCategory)).default([]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const [lastFisherfolk, tenant] = await Promise.all([
          ctx.db.fisherfolk.findFirst({
            where: { tenantId: ctx.tenantId },
            orderBy: { fisherfolkCode: "desc" },
          }),
          ctx.db.tenant.findUniqueOrThrow({ where: { id: ctx.tenantId } }),
        ])
        const lastSeq = lastFisherfolk != null
          ? parseInt(lastFisherfolk.fisherfolkCode.split("-")[1] ?? "0", 10)
          : 0
        const fisherfolkCode = `${tenant.slug.toUpperCase()}-${(lastSeq + 1).toString().padStart(6, "0")}`

        return ctx.db.fisherfolk.create({
          data: {
            tenantId: ctx.tenantId,
            fisherfolkCode,
            firstName: input.firstName,
            middleName: input.middleName ?? null,
            lastName: input.lastName,
            dateOfBirth: new Date(input.dateOfBirth),
            sex: input.sex,
            barangayId: input.barangayId,
            contactNumber: input.contactNumber ?? null,
            rsbsaNumber: input.rsbsaNumber ?? null,
            activityCategories: input.activityCategories,
          },
        })
      }),

    update: tenantProcedure
      .input(
        z.object({
          id: z.string(),
          firstName: z.string().min(1).optional(),
          middleName: z.string().nullable().optional(),
          lastName: z.string().min(1).optional(),
          dateOfBirth: z.string().optional(),
          sex: z.nativeEnum(Sex).optional(),
          barangayId: z.string().optional(),
          contactNumber: z.string().nullable().optional(),
          rsbsaNumber: z.string().nullable().optional(),
          activityCategories: z.array(z.nativeEnum(ActivityCategory)).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.db.fisherfolk.update({
          where: { id: input.id, tenantId: ctx.tenantId },
          data: {
            ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
            ...(input.middleName !== undefined ? { middleName: input.middleName } : {}),
            ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
            ...(input.dateOfBirth !== undefined ? { dateOfBirth: new Date(input.dateOfBirth) } : {}),
            ...(input.sex !== undefined ? { sex: input.sex } : {}),
            ...(input.barangayId !== undefined ? { barangayId: input.barangayId } : {}),
            ...(input.contactNumber !== undefined ? { contactNumber: input.contactNumber } : {}),
            ...(input.rsbsaNumber !== undefined ? { rsbsaNumber: input.rsbsaNumber } : {}),
            ...(input.activityCategories !== undefined
              ? { activityCategories: input.activityCategories }
              : {}),
          },
        })
      }),

    deactivate: authorizedTenantProcedure([...APPROVE_ROLES])
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.db.fisherfolk.update({
          where: { id: input.id, tenantId: ctx.tenantId },
          data: { isActive: false },
        })
      }),
  }),

  // ── Vessel ─────────────────────────────────────────────────────────────────
  vessel: router({
    list: tenantProcedure
      .input(z.object({ search: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return ctx.db.vessel.findMany({
          where: {
            tenantId: ctx.tenantId,
            isActive: true,
            ...(input?.search != null
              ? {
                  OR: [
                    { vesselName: { contains: input.search, mode: "insensitive" } },
                    { registrationNumber: { contains: input.search, mode: "insensitive" } },
                  ],
                }
              : {}),
          },
          include: { owner: true, homePortBarangay: true },
          orderBy: { vesselName: "asc" },
        })
      }),

    byId: tenantProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        return ctx.db.vessel.findFirst({
          where: { id: input.id, tenantId: ctx.tenantId },
          include: {
            owner: true,
            homePortBarangay: true,
            permits: { orderBy: { createdAt: "desc" } },
            catchReports: { take: 10, orderBy: { catchDate: "desc" } },
          },
        })
      }),

    create: tenantProcedure
      .input(
        z.object({
          ownerId: z.string(),
          vesselName: z.string().min(1),
          registrationNumber: z.string().min(1),
          type: z.nativeEnum(VesselType),
          lengthMeters: z.number().positive().optional(),
          tonnage: z.number().positive().optional(),
          gearType: z.string().optional(),
          homePortBarangayId: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const owner = await ctx.db.fisherfolk.findFirst({
          where: { id: input.ownerId, tenantId: ctx.tenantId, isActive: true },
        })
        if (owner == null) throw new Error("Fisherfolk owner not found or inactive")

        return ctx.db.vessel.create({
          data: {
            tenantId: ctx.tenantId,
            ownerId: input.ownerId,
            vesselName: input.vesselName,
            registrationNumber: input.registrationNumber,
            type: input.type,
            homePortBarangayId: input.homePortBarangayId,
            lengthMeters: input.lengthMeters ?? null,
            tonnage: input.tonnage ?? null,
            gearType: input.gearType ?? null,
          },
        })
      }),

    update: tenantProcedure
      .input(
        z.object({
          id: z.string(),
          vesselName: z.string().optional(),
          registrationNumber: z.string().optional(),
          type: z.nativeEnum(VesselType).optional(),
          lengthMeters: z.number().positive().nullable().optional(),
          tonnage: z.number().positive().nullable().optional(),
          gearType: z.string().nullable().optional(),
          homePortBarangayId: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.db.vessel.update({
          where: { id: input.id, tenantId: ctx.tenantId },
          data: {
            ...(input.vesselName !== undefined ? { vesselName: input.vesselName } : {}),
            ...(input.registrationNumber !== undefined
              ? { registrationNumber: input.registrationNumber }
              : {}),
            ...(input.type !== undefined ? { type: input.type } : {}),
            ...(input.homePortBarangayId !== undefined
              ? { homePortBarangayId: input.homePortBarangayId }
              : {}),
            ...(input.lengthMeters !== undefined ? { lengthMeters: input.lengthMeters } : {}),
            ...(input.tonnage !== undefined ? { tonnage: input.tonnage } : {}),
            ...(input.gearType !== undefined ? { gearType: input.gearType } : {}),
          },
        })
      }),
  }),

  // ── Permit ─────────────────────────────────────────────────────────────────
  permit: router({
    list: tenantProcedure
      .input(
        z
          .object({
            status: z.nativeEnum(PermitStatus).optional(),
            vesselId: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        return ctx.db.permit.findMany({
          where: {
            tenantId: ctx.tenantId,
            ...(input?.status != null ? { status: input.status } : {}),
            ...(input?.vesselId != null ? { vesselId: input.vesselId } : {}),
          },
          include: { vessel: { include: { owner: true } }, approvedBy: true },
          orderBy: { createdAt: "desc" },
        })
      }),

    byId: tenantProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        return ctx.db.permit.findFirst({
          where: { id: input.id, tenantId: ctx.tenantId },
          include: {
            vessel: { include: { owner: true, homePortBarangay: true } },
            approvedBy: true,
          },
        })
      }),

    create: tenantProcedure
      .input(
        z.object({
          vesselId: z.string(),
          type: z.nativeEnum(PermitType),
          status: z.enum(["DRAFT", "SUBMITTED"]).default("DRAFT"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await ctx.db.permit.findFirst({
          where: {
            vesselId: input.vesselId,
            tenantId: ctx.tenantId,
            type: input.type,
            status: {
              in: [PermitStatus.APPROVED, PermitStatus.SUBMITTED, PermitStatus.UNDER_REVIEW],
            },
          },
        })
        if (existing != null) {
          throw new Error(
            `Vessel already has an active ${input.type} permit (status: ${existing.status})`
          )
        }
        return ctx.db.permit.create({
          data: {
            tenantId: ctx.tenantId,
            vesselId: input.vesselId,
            type: input.type,
            status: input.status,
          },
        })
      }),

    submit: tenantProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.db.permit.update({
          where: { id: input.id, tenantId: ctx.tenantId },
          data: { status: PermitStatus.SUBMITTED },
        })
      }),

    startReview: authorizedTenantProcedure([...APPROVE_ROLES])
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.db.permit.update({
          where: { id: input.id, tenantId: ctx.tenantId },
          data: { status: PermitStatus.UNDER_REVIEW },
        })
      }),

    approve: authorizedTenantProcedure([...APPROVE_ROLES])
      .input(z.object({ id: z.string(), expiresAt: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.db.permit.update({
          where: { id: input.id, tenantId: ctx.tenantId },
          data: {
            status: PermitStatus.APPROVED,
            issuedAt: new Date(),
            expiresAt: new Date(input.expiresAt),
            approvedById: ctx.session.user.id,
          },
        })
      }),

    reject: authorizedTenantProcedure([...APPROVE_ROLES])
      .input(z.object({ id: z.string(), rejectionNotes: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        return ctx.db.permit.update({
          where: { id: input.id, tenantId: ctx.tenantId },
          data: {
            status: PermitStatus.REJECTED,
            rejectionNotes: input.rejectionNotes,
          },
        })
      }),
  }),

  // ── CatchReport ────────────────────────────────────────────────────────────
  catchReport: router({
    list: tenantProcedure
      .input(
        z
          .object({
            vesselId: z.string().optional(),
            fisherfolkId: z.string().optional(),
            limit: z.number().min(1).max(100).default(50),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        return ctx.db.catchReport.findMany({
          where: {
            tenantId: ctx.tenantId,
            ...(input?.vesselId != null ? { vesselId: input.vesselId } : {}),
            ...(input?.fisherfolkId != null ? { fisherfolkId: input.fisherfolkId } : {}),
          },
          include: { vessel: true, fisherfolk: true, species: true },
          orderBy: { catchDate: "desc" },
          take: input?.limit ?? 50,
        })
      }),

    create: tenantProcedure
      .input(
        z.object({
          vesselId: z.string(),
          fisherfolkId: z.string(),
          speciesId: z.string().optional(),
          speciesFreeText: z.string().optional(),
          catchVolumeKg: z.number().positive(),
          catchDate: z.string(),
          landingLocation: z.string().min(1),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.db.catchReport.create({
          data: {
            tenantId: ctx.tenantId,
            vesselId: input.vesselId,
            fisherfolkId: input.fisherfolkId,
            speciesId: input.speciesId ?? null,
            speciesFreeText: input.speciesFreeText ?? null,
            catchVolumeKg: input.catchVolumeKg,
            catchDate: new Date(input.catchDate),
            landingLocation: input.landingLocation,
            notes: input.notes ?? null,
          },
        })
      }),
  }),

  // ── Program ────────────────────────────────────────────────────────────────
  program: router({
    list: tenantProcedure.query(async ({ ctx }) => {
      return ctx.db.program.findMany({
        where: { tenantId: ctx.tenantId },
        include: { _count: { select: { beneficiaries: true } } },
        orderBy: { startDate: "desc" },
      })
    }),

    byId: tenantProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        return ctx.db.program.findFirst({
          where: { id: input.id, tenantId: ctx.tenantId },
          include: {
            beneficiaries: {
              include: { fisherfolk: { include: { barangay: true } } },
              orderBy: { enrolledAt: "desc" },
            },
            distributions: {
              include: { fisherfolk: true },
              orderBy: { distributionDate: "desc" },
            },
          },
        })
      }),

    create: tenantProcedure
      .input(
        z.object({
          name: z.string().min(1),
          type: z.nativeEnum(ProgramType),
          description: z.string().optional(),
          startDate: z.string(),
          endDate: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.db.program.create({
          data: {
            tenantId: ctx.tenantId,
            name: input.name,
            type: input.type,
            description: input.description ?? null,
            startDate: new Date(input.startDate),
            endDate: input.endDate != null ? new Date(input.endDate) : null,
          },
        })
      }),

    enrollBeneficiary: tenantProcedure
      .input(z.object({ programId: z.string(), fisherfolkId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const program = await ctx.db.program.findFirst({
          where: { id: input.programId, tenantId: ctx.tenantId },
        })
        if (program == null) throw new Error("Program not found")

        const existing = await ctx.db.programBeneficiary.findUnique({
          where: {
            programId_fisherfolkId: {
              programId: input.programId,
              fisherfolkId: input.fisherfolkId,
            },
          },
        })
        if (existing != null) throw new Error("Fisherfolk already enrolled in this program")

        return ctx.db.programBeneficiary.create({ data: input })
      }),
  }),

  // ── Incident ───────────────────────────────────────────────────────────────
  incident: router({
    list: tenantProcedure
      .input(
        z
          .object({
            status: z.nativeEnum(IncidentStatus).optional(),
            limit: z.number().min(1).max(100).default(50),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        return ctx.db.incident.findMany({
          where: {
            tenantId: ctx.tenantId,
            ...(input?.status != null ? { status: input.status } : {}),
          },
          include: { reportedBy: true, vessel: true },
          orderBy: { incidentDate: "desc" },
          take: input?.limit ?? 50,
        })
      }),

    create: tenantProcedure
      .input(
        z.object({
          violatorName: z.string().min(1),
          violatorInfo: z.string().optional(),
          vesselId: z.string().optional(),
          gearUsed: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          incidentDate: z.string(),
          description: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.db.incident.create({
          data: {
            tenantId: ctx.tenantId,
            reportedById: ctx.session.user.id,
            violatorName: input.violatorName,
            violatorInfo: input.violatorInfo ?? null,
            vesselId: input.vesselId ?? null,
            gearUsed: input.gearUsed ?? null,
            latitude: input.latitude ?? null,
            longitude: input.longitude ?? null,
            incidentDate: new Date(input.incidentDate),
            description: input.description,
            evidenceUrls: [],
            status: IncidentStatus.REPORTED,
          },
        })
      }),

    updateStatus: authorizedTenantProcedure([
      ...ADMIN_ROLES,
      Role.FISHERIES_OFFICER,
    ])
      .input(z.object({ id: z.string(), status: z.nativeEnum(IncidentStatus) }))
      .mutation(async ({ ctx, input }) => {
        return ctx.db.incident.update({
          where: { id: input.id, tenantId: ctx.tenantId },
          data: { status: input.status },
        })
      }),
  }),

  // ── Patrol ─────────────────────────────────────────────────────────────────
  patrol: router({
    list: tenantProcedure
      .input(
        z
          .object({
            status: z.nativeEnum(PatrolStatus).optional(),
            limit: z.number().min(1).max(100).default(50),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        return ctx.db.patrol.findMany({
          where: {
            tenantId: ctx.tenantId,
            ...(input?.status != null ? { status: input.status } : {}),
          },
          include: { vessel: true, startedBy: true },
          orderBy: { startTime: "desc" },
          take: input?.limit ?? 50,
        })
      }),

    create: tenantProcedure
      .input(
        z.object({
          vesselId: z.string(),
          startTime: z.string(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.db.patrol.create({
          data: {
            tenantId: ctx.tenantId,
            startedById: ctx.session.user.id,
            vesselId: input.vesselId,
            startTime: new Date(input.startTime),
            status: PatrolStatus.IN_PROGRESS,
            notes: input.notes ?? null,
          },
        })
      }),

    complete: tenantProcedure
      .input(
        z.object({
          id: z.string(),
          endTime: z.string(),
          fuelConsumedLiters: z.number().positive().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.db.patrol.update({
          where: { id: input.id, tenantId: ctx.tenantId },
          data: {
            status: PatrolStatus.COMPLETED,
            endTime: new Date(input.endTime),
            fuelConsumedLiters: input.fuelConsumedLiters ?? null,
            notes: input.notes ?? null,
          },
        })
      }),
  }),

  // ── User management (SUPER_ADMIN / BA_ADMIN only) ──────────────────────────
  user: router({
    list: authorizedProcedure([...ADMIN_ROLES])
      .input(z.object({ tenantId: z.string() }))
      .query(async ({ ctx, input }) => {
        return ctx.db.tenantMembership.findMany({
          where: { tenantId: input.tenantId, isActive: true },
          include: { user: true },
          orderBy: { createdAt: "asc" },
        })
      }),

    deactivateMembership: authorizedProcedure([...ADMIN_ROLES])
      .input(z.object({ membershipId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.db.tenantMembership.update({
          where: { id: input.membershipId },
          data: { isActive: false },
        })
      }),

    updateRole: authorizedProcedure([...ADMIN_ROLES])
      .input(z.object({ membershipId: z.string(), role: z.nativeEnum(Role) }))
      .mutation(async ({ ctx, input }) => {
        return ctx.db.tenantMembership.update({
          where: { id: input.membershipId },
          data: { role: input.role },
        })
      }),
  }),

  // ── Tenant management (BA_ADMIN only) ──────────────────────────────────────
  tenant: router({
    list: authorizedProcedure([Role.BA_ADMIN, Role.BA_ANALYST]).query(async ({ ctx }) => {
      return ctx.db.tenant.findMany({
        where: { isActive: true },
        include: { _count: { select: { memberships: true, fisherfolks: true } } },
        orderBy: { name: "asc" },
      })
    }),

    provision: authorizedProcedure([Role.BA_ADMIN])
      .input(
        z.object({
          name: z.string().min(1),
          slug: z
            .string()
            .min(2)
            .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
          logoUrl: z.string().url().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await ctx.db.tenant.findUnique({ where: { slug: input.slug } })
        if (existing != null) throw new Error(`Slug "${input.slug}" is already taken`)

        const tenant = await ctx.db.tenant.create({
          data: {
            name: input.name,
            slug: input.slug,
            type: "LGU",
            logoUrl: input.logoUrl ?? null,
          },
        })

        const barangays = [
          "Balingayan", "Balite", "Baruyan", "Batino", "Bayanan I", "Bayanan II",
          "Biga", "Bondoc", "Bucayao", "Buhuan", "Bulusan", "Calero", "Camansihan",
          "Camilmil", "Canubing I", "Canubing II", "Comunal", "Guinobatan", "Gulod",
          "Gutad", "Ibaba East", "Ibaba West", "Ilaya", "Lalud", "Lazareto", "Libis",
          "Lumang Bayan", "Mahal na Pangalan", "Maidlang", "Malad", "Malamig",
          "Managpi", "Masipit", "Nag-iba I", "Nag-iba II", "Navotas", "Pachoca",
          "Palhi", "Panggalaan", "Parang", "Patas", "Personas", "Putingtubig",
          "Salong", "San Antonio", "San Vicente Central", "San Vicente East",
          "San Vicente North", "San Vicente South", "San Vicente West", "Santa Cruz",
          "Santa Isabel", "Santa Maria Village", "Santa Rita", "Santo Niño", "Sapul",
          "Silonay", "Suqui", "Tawagan", "Tawiran", "Tibag", "Wawa",
        ]

        await ctx.db.barangay.createMany({
          data: barangays.map((name) => ({ tenantId: tenant.id, name })),
        })

        return { tenant, url: `/${tenant.slug}` }
      }),
  }),
})

export type AppRouter = typeof appRouter
