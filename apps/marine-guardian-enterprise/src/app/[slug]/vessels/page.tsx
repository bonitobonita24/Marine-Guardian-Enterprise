"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { trpc } from "@/trpc/client"
import { Badge } from "@marine-guardian/ui"

export default function VesselsPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { data, isLoading } = trpc.vessel.list.useQuery()

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vessel Registry</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data != null ? `${data.length} active vessels` : "Loading…"}
          </p>
        </div>
        <Link
          href={`/${slug}/vessels/new`}
          className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors"
        >
          + Add Vessel
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading…</div>
        ) : data == null || data.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No vessels registered yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Vessel Name</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Reg. No.</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Owner</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Home Port</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((vessel) => (
                <tr key={vessel.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{vessel.vesselName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{vessel.registrationNumber}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{vessel.type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {vessel.owner != null
                      ? `${vessel.owner.lastName}, ${vessel.owner.firstName}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{vessel.homePortBarangay?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/${slug}/vessels/${vessel.id}`}
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
