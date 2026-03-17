"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { trpc } from "@/trpc/client"
import { Badge } from "@marine-guardian/ui"
import { IncidentStatus } from "@marine-guardian/shared"

const statusColors: Record<IncidentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  REPORTED: "outline",
  UNDER_INVESTIGATION: "default",
  RESOLVED: "default",
  DISMISSED: "secondary",
}

export default function IncidentsPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { data, isLoading } = trpc.incident.list.useQuery()

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Incidents</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data != null ? `${data.length} incidents` : "Loading…"}
          </p>
        </div>
        <Link
          href={`/${slug}/incidents/new`}
          className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          + Report Incident
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading…</div>
        ) : data == null || data.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No incidents reported.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Violator</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Description</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {new Date(inc.incidentDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{inc.violatorName}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                    {inc.description}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusColors[inc.status] ?? "secondary"}>{inc.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/${slug}/incidents/${inc.id}`}
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
