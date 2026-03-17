import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma as db } from "@marine-guardian/db"
import bcrypt from "bcryptjs"
import { Role } from "@marine-guardian/shared"

// ─── Module augmentations (next-auth v5 beta) ────────────────────────────────
// Only augment the "next-auth" module — the jwt subpath is not exported in v5 beta.
// JWT fields are tracked via AppJWT local type + explicit casting in callbacks.

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      tenantId: string | null
      role: Role
      activeTenantSlug: string | null
    }
  }

  interface User {
    tenantId?: string | null
    role?: Role
    activeTenantSlug?: string | null
  }
}

// ─── Local JWT shape (avoids next-auth/jwt subpath which isn't exported in beta) ──

type AppJWT = {
  sub?: string
  iat?: number
  exp?: number
  jti?: string
  id: string
  tenantId: string | null
  role: Role
  activeTenantSlug: string | null
}

// ─── Auth config ──────────────────────────────────────────────────────────────

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          typeof credentials?.email !== "string" ||
          typeof credentials?.password !== "string"
        ) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { memberships: { include: { tenant: true } } },
        })

        if (user == null || !user.passwordHash) return null

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) return null

        const activeMembership =
          user.memberships.find((m) => m.tenantId === user.lastActiveTenantId) ??
          user.memberships[0]

        // Prisma's Role is a string-union; shared Role is a TS enum — same values.
        const role = (activeMembership?.role ?? "VIEWER") as Role

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: activeMembership?.tenantId ?? null,
          role,
          activeTenantSlug: activeMembership?.tenant?.slug ?? null,
        }
      },
    }),
  ],
  callbacks: {
    // jwt callback — no await, explicit AppJWT cast avoids next-auth/jwt augmentation
    jwt({ token, user, trigger, session }) {
      // Cast to our AppJWT shape; both types represent the same JWT object at runtime
      const t = token as unknown as AppJWT

      if (user) {
        t.id = user.id ?? ""
        t.tenantId = user.tenantId ?? null
        t.role = user.role ?? Role.VIEWER
        t.activeTenantSlug = user.activeTenantSlug ?? null
      }

      // Handle tenant-switch update
      if (trigger === "update") {
        const update = session as {
          tenantId?: string | null
          role?: Role
          activeTenantSlug?: string | null
        }
        if (update.tenantId !== undefined) t.tenantId = update.tenantId ?? null
        if (update.role !== undefined) t.role = update.role
        if (update.activeTenantSlug !== undefined) {
          t.activeTenantSlug = update.activeTenantSlug ?? null
        }
      }

      return t
    },

    // session callback — no await needed
    session({ session, token }) {
      const t = token as unknown as AppJWT
      // Return a new session object so TypeScript can track the merged type
      return {
        ...session,
        user: {
          id: t.id,
          name: session.user?.name ?? null,
          email: session.user?.email ?? null,
          image: session.user?.image ?? null,
          tenantId: t.tenantId,
          role: t.role,
          activeTenantSlug: t.activeTenantSlug,
        },
      }
    },
  },
}

// ─── NextAuth exports ─────────────────────────────────────────────────────────

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
