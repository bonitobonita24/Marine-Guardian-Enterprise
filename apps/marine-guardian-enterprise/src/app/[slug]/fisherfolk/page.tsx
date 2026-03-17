"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { trpc } from "@/trpc/client"
import { Badge } from "@marine-guardian/ui"

export default function FisherfolkPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const { data, isLoading } = trpc.fisherfolk.list.useQuery(
    { search: debouncedSearch !== "" ? debouncedSearch : undefined },
    { enabled: true }
  )

  const handleSearch = (value: string) => {
    setSearch(value)
    clearTimeout(undefined)
    const t = setTimeout(() => setDebouncedSearch(value), 350)
    return t
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fisherfolk Registry</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data != null ? `${data.length} registrations` : "Loading…"}
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href={`/api/export/fisherfolk?tenantSlug=${slug}`}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Export CSV
          </a>
          <Link
            href={`/${slug}/fisherfolk/new`}
            className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors"
          >
            + Register Fisherfolk
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="search"
          placeholder="Search by name, code, RSBSA…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading…</div>
        ) : data == null || data.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            {search !== "" ? "No results found." : "No fisherfolk registered yet."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Code</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Barangay</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((ff) => (
                <tr key={ff.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{ff.fisherfolkCode}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {ff.lastName}, {ff.firstName}
                    {ff.middleName != null ? ` ${ff.middleName[0]}.` : ""}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{ff.barangay?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={ff.isActive ? "default" : "secondary"}>
                      {ff.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/${slug}/fisherfolk/${ff.id}`}
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
