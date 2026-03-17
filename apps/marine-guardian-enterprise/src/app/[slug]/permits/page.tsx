"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { trpc } from "@/trpc/client"
import { Badge } from "@marine-guardian/ui"
import { PermitStatus } from "@marine-guardian/shared"

const statusColors: Record<PermitStatus, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  SUBMITTED: "outline",
  UNDER_REVIEW: "outline",
  APPROVED: "default",
  REJECTED: "destructive",
  EXPIRED: "destructive",
}

export default function PermitsPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { data, isLoading } = trpc.permit.list.useQuery()

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Permits</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data != null ? `${data.length} permits` : "Loading…"}
          </p>
        </div>
        <Link
          href={`/${slug}/permits/new`}
          className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          + New Permit
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading…</div>
        ) : data == null || data.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No permits yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Permit</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Vessel</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Owner</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {p.type} Permit
                    {p.issuedAt != null && (
                      <span className="ml-2 text-xs text-slate-400">
                        expires {new Date(p.expiresAt ?? "").toLocaleDateString()}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.vessel?.vesselName ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.vessel?.owner != null
                      ? `${p.vessel.owner.lastName}, ${p.vessel.owner.firstName}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusColors[p.status] ?? "secondary"}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/${slug}/permits/${p.id}`} className="text-blue-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
