"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { trpc } from "@/trpc/client"
import { Badge } from "@marine-guardian/ui"

export default function ProgramsPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { data, isLoading } = trpc.program.list.useQuery()

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Programs</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data != null ? `${data.length} programs` : "Loading…"}
          </p>
        </div>
        <Link
          href={`/${slug}/programs/new`}
          className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          + New Program
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-sm text-slate-400">Loading…</div>
        ) : data == null || data.length === 0 ? (
          <div className="col-span-full p-8 text-center text-sm text-slate-400">No programs yet.</div>
        ) : (
          data.map((program) => (
            <div
              key={program.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{program.name}</h3>
                  <Badge variant="secondary" className="mt-1">
                    {program.type}
                  </Badge>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                {program.description ?? "No description"}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>
                  {new Date(program.startDate).toLocaleDateString()}
                  {program.endDate != null
                    ? ` – ${new Date(program.endDate).toLocaleDateString()}`
                    : " – ongoing"}
                </span>
                <span>{program._count.beneficiaries} beneficiaries</span>
              </div>
              <Link
                href={`/${slug}/programs/${program.id}`}
                className="mt-3 block text-center text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View Details →
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
