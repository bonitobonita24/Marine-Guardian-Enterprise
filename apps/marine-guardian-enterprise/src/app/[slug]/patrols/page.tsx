"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { trpc } from "@/trpc/client"
import { Badge } from "@marine-guardian/ui"
import { PatrolStatus } from "@marine-guardian/shared"

const statusColors: Record<PatrolStatus, "default" | "secondary" | "outline"> = {
  IN_PROGRESS: "default",
  COMPLETED: "secondary",
  CANCELLED: "outline",
}

export default function PatrolsPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { data, isLoading } = trpc.patrol.list.useQuery()

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patrols</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data != null ? `${data.length} patrols` : "Loading…"}
          </p>
        </div>
        <Link
          href={`/${slug}/patrols/new`}
          className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          + Start Patrol
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading…</div>
        ) : data == null || data.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No patrols recorded.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Start Time</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">End Time</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Vessel</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Started By</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((patrol) => (
                <tr key={patrol.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {new Date(patrol.startTime).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {patrol.endTime != null ? new Date(patrol.endTime).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-900">
                    {patrol.vessel?.vesselName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {patrol.startedBy?.name ?? patrol.startedBy?.email ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusColors[patrol.status] ?? "secondary"}>
                      {patrol.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/${slug}/patrols/${patrol.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
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
