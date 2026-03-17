"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { trpc } from "@/trpc/client"

export default function SettingsPage() {
  const router = useRouter()
  const { data: session, update: updateSession } = useSession()
  const { data: memberships, isLoading } = trpc.memberships.useQuery()
  const switchTenant = trpc.settings.switchTenant.useMutation({
    onSuccess: async (data) => {
      await updateSession({
        tenantId: data.tenantId,
        activeTenantSlug: data.tenantSlug,
        role: data.role,
      })
      router.push(`/${data.tenantSlug}`)
    },
  })

  const [showPassword, setShowPassword] = useState(false)

  if (session == null) {
    return <div className="p-8 text-center text-slate-400">Not authenticated</div>
  }

  const { user } = session

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Settings</h1>

      {/* Profile Section */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Profile</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Name</span>
            <span className="font-medium text-slate-900">{user.name ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Email</span>
            <span className="font-medium text-slate-900">{user.email ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Role</span>
            <span className="font-medium text-slate-900">{user.role}</span>
          </div>
        </div>
      </section>

      {/* Tenant Switcher */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Active Tenant</h2>
        {isLoading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : memberships != null && memberships.length > 0 ? (
          <div className="space-y-2">
            {memberships.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => switchTenant.mutate({ tenantId: m.tenant.id })}
                disabled={m.tenant.slug === user.activeTenantSlug || switchTenant.isPending}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  m.tenant.slug === user.activeTenantSlug
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"
                }`}
              >
                <div>
                  <p className="font-medium text-slate-900">{m.tenant.name}</p>
                  <p className="text-xs text-slate-500">{m.tenant.slug}</p>
                </div>
                {m.tenant.slug === user.activeTenantSlug && (
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No tenant memberships found.</p>
        )}
      </section>

      {/* Password Change (placeholder) */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Change Password</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-slate-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="••••••••"
            />
          </div>
          <button
            type="button"
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Update Password
          </button>
        </div>
      </section>

      {/* Sign Out */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Sign Out</h2>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/login" })}
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Sign Out
        </button>
      </section>
    </div>
  )
}
