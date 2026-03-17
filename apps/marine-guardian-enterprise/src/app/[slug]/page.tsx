import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createTRPCContext } from "@/trpc/server"
import { appRouter } from "@/trpc/router"

interface PageProps {
  params: Promise<{ slug: string }>
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: number | string
  sub?: string
  color: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1.5 text-3xl font-bold ${color}`}>{value.toLocaleString()}</p>
      {sub != null && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  )
}

// ─── Page (Server Component) ──────────────────────────────────────────────────

export default async function DashboardPage({ params }: PageProps) {
  const session = await auth()
  if (session == null) redirect("/login")

  const { slug } = await params

  const ctx = await createTRPCContext({ headers: await headers() })
  const caller = appRouter.createCaller(ctx)

  let stats
  try {
    stats = await caller.dashboard.lguStats()
  } catch {
    stats = null
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          {slug.toUpperCase()} · {session.user.role}
        </p>
      </div>

      {stats == null ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
          Could not load statistics. Check database connection.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatCard
            label="Registered Fisherfolk"
            value={stats.fisherfolkCount}
            sub="Active registrations"
            color="text-blue-700"
          />
          <StatCard
            label="Active Vessels"
            value={stats.vesselCount}
            sub="In fleet"
            color="text-teal-700"
          />
          <StatCard
            label="Approved Permits"
            value={stats.activePermitCount}
            sub={`of ${stats.permitCount} total`}
            color="text-green-700"
          />
          <StatCard
            label="Total Catch"
            value={`${stats.totalCatchKg.toFixed(1)} kg`}
            sub="All time"
            color="text-amber-700"
          />
          <StatCard
            label="Incidents"
            value={stats.incidentCount}
            sub="Reported"
            color="text-red-700"
          />
        </div>
      )}

      <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: `/${slug}/fisherfolk`, label: "Register Fisherfolk" },
            { href: `/${slug}/vessels`, label: "Add Vessel" },
            { href: `/${slug}/permits`, label: "New Permit" },
            { href: `/${slug}/catch-reports`, label: "Log Catch" },
            { href: `/${slug}/incidents`, label: "Report Incident" },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
