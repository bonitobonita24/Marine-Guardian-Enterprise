import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma as db } from "@marine-guardian/db"
import bcrypt from "bcryptjs"
import { Role } from "@marine-guardian/shared"
import type { DefaultUser } from "next-auth"

// Extend the session and JWT types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      tenantId: string | null
      role: Role
      activeTenantSlug: string | null
    } & DefaultUser
  }
  
  interface User {
    tenantId?: string | null
    role?: Role
    activeTenantSlug?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    tenantId: string | null
    role: Role
    activeTenantSlug: string | null
  }
}

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
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            memberships: {
              include: { tenant: true },
            },
          },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) {
          return null
        }

        // Get most recently used tenant or first membership
        const activeMembership = user.memberships.find(
          (m) => m.tenantId === user.lastActiveTenantId
        ) ?? user.memberships[0]

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: activeMembership?.tenantId ?? null,
          role: activeMembership?.role ?? Role.VIEWER,
          activeTenantSlug: activeMembership?.tenant?.slug ?? null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.tenantId = user.tenantId
        token.role = user.role ?? Role.VIEWER
        token.activeTenantSlug = user.activeTenantSlug
      }

      // Handle session update (e.g., tenant switch)
      if (trigger === "update" && session) {
        token.tenantId = session.tenantId
        token.role = session.role
        token.activeTenantSlug = session.activeTenantSlug
      }

      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.tenantId = token.tenantId
      session.user.role = token.role
      session.user.activeTenantSlug = token.activeTenantSlug
      return session
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
