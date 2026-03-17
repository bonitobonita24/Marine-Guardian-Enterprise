"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { trpc } from "@/trpc/client"

export default function CatchReportsPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { data, isLoading } = trpc.catchReport.list.useQuery()

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catch Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data != null ? `${data.length} records` : "Loading…"}
          </p>
        </div>
        <Link
          href={`/${slug}/catch-reports/new`}
          className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          + Log Catch
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading…</div>
        ) : data == null || data.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No catch reports yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Fisherfolk</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Vessel</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Species</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Volume (kg)</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((cr) => (
                <tr key={cr.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {new Date(cr.catchDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-900">
                    {cr.fisherfolk != null
                      ? `${cr.fisherfolk.lastName}, ${cr.fisherfolk.firstName}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{cr.vessel?.vesselName ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {cr.species?.name ?? cr.speciesFreeText ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {cr.catchVolumeKg.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{cr.landingLocation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
