"use client"

import type { JSX } from "react"
import { useParams, useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"

export default function VesselDetailPage(): JSX.Element {
  const router = useRouter()
  const params = useParams<{ slug: string; id: string }>()
  const { slug, id } = params

  const { data: vessel, isLoading, error } = trpc.vessel.byId.useQuery({ id })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (Boolean(error) || !vessel) {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          Vessel not found or you don't have permission to view this record.
        </div>
        <button
          onClick={() => router.push(`/${slug}/vessels`)}
          className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
        >
          Back to Vessels
        </button>
      </div>
    )
  }

  const v = vessel

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push(`/${slug}/vessels`)}
            className="mb-2 text-sm text-slate-500 hover:text-slate-700"
          >
            ← Back to Vessels
          </button>
          <h1 className="text-2xl font-bold text-slate-900">{v.vesselName}</h1>
          <p className="text-sm text-slate-500">{v.registrationNumber}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/${slug}/vessels/${id}/edit`)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Vessel Information</h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-slate-500">Vessel Name</dt>
              <dd className="mt-1 text-sm text-slate-900">{v.vesselName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Registration Number</dt>
              <dd className="mt-1 text-sm text-slate-900">{v.registrationNumber}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Type</dt>
              <dd className="mt-1 text-sm text-slate-900">{v.type}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Gear Type</dt>
              <dd className="mt-1 text-sm text-slate-900">{v.gearType ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Length</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {v.lengthMeters != null ? `${v.lengthMeters} meters` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Tonnage</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {v.tonnage != null ? `${v.tonnage} GT` : "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Owner & Home Port</h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-slate-500">Owner</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {v.owner
                  ? `${v.owner.fisherfolkCode} — ${v.owner.firstName} ${v.owner.lastName}`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Home Port Barangay</dt>
              <dd className="mt-1 text-sm text-slate-900">{v.homePortBarangay?.name ?? "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Record Information</h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-slate-500">Status</dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    v.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {v.isActive ? "Active" : "Inactive"}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Created</dt>
              <dd className="mt-1 text-sm text-slate-900">{formatDate(v.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-slate-900">{formatDate(v.updatedAt)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  )
}
